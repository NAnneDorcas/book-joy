import type { Handler } from "@netlify/functions";
import { createClient } from "@supabase/supabase-js";
import OpenAI from "openai";
import { Resend } from "resend";

const teamSlug = process.env.TEAM_SLUG || "TEAM_SLUG";

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

const resend = new Resend(process.env.RESEND_API_KEY!);

async function getBusinessInfo() {
  const { data } = await supabase
    .from("agent_settings")
    .select("*")
    .eq("id", 1)
    .single();

  return data;
}

async function checkAvailability(date: string) {
  const start = `${date}T00:00:00`;
  const end = `${date}T23:59:59`;

  const { data: bookings } = await supabase
    .from("bookings")
    .select("start_time,end_time,status")
    .gte("start_time", start)
    .lte("start_time", end)
    .eq("status", "confirmed");

  const bookedTimes = (bookings || []).map((booking: any) =>
    new Date(booking.start_time).toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
    })
  );

  const allSlots = [
    "09:00",
    "10:00",
    "11:00",
    "12:00",
    "13:00",
    "14:00",
    "15:00",
    "16:00",
  ];

  const availableSlots = allSlots.filter((slot) => !bookedTimes.includes(slot));

  return {
    date,
    availableSlots,
  };
}

async function createBooking(details: any) {
  const {
    service_name,
    customer_name,
    customer_email,
    customer_phone,
    date,
    time,
    notes,
  } = details;

  const { data: service, error: serviceError } = await supabase
    .from("services")
    .select("*")
    .ilike("name", `%${service_name}%`)
    .eq("is_active", true)
    .limit(1)
    .single();

  if (serviceError || !service) {
    throw new Error("Service not found.");
  }

  const startTime = new Date(`${date}T${time}:00`);
  const endTime = new Date(
    startTime.getTime() + service.duration_minutes * 60 * 1000
  );

  const { data: booking, error } = await supabase
    .from("bookings")
    .insert({
      service_id: service.id,
      customer_name,
      customer_email,
      customer_phone: customer_phone || null,
      start_time: startTime.toISOString(),
      end_time: endTime.toISOString(),
      notes: notes || null,
      status: "confirmed",
      team_slug: teamSlug,
      source: "ai-booking-2026",
    })
    .select("id")
    .single();

  if (error) {
    throw error;
  }

  const subject = `[BOOKING-2026] ${teamSlug} New booking confirmed`;

  const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6;">
      <h2>Booking confirmed</h2>
      <p><strong>Booking ID:</strong> ${booking.id}</p>
      <p><strong>Customer:</strong> ${customer_name}</p>
      <p><strong>Email:</strong> ${customer_email}</p>
      <p><strong>Phone:</strong> ${customer_phone || "-"}</p>
      <p><strong>Service:</strong> ${service.name}</p>
      <p><strong>Start:</strong> ${startTime.toLocaleString()}</p>
      <p><strong>End:</strong> ${endTime.toLocaleString()}</p>
    </div>
  `;

  await resend.emails.send({
    from: "BookingAgent Pro <onboarding@resend.dev>",
    to: [customer_email, process.env.INQUIRY_TO_EMAIL!],
    subject,
    html,
  });

  return {
    booking_id: booking.id,
    service: service.name,
    start_time: startTime.toISOString(),
    end_time: endTime.toISOString(),
  };
}

export const handler: Handler = async (event) => {
  try {
    if (event.httpMethod !== "POST") {
      return {
        statusCode: 405,
        body: JSON.stringify({ error: "Method not allowed" }),
      };
    }

    const body = JSON.parse(event.body || "{}");
    const userMessage = body.message || "";
    const sessionId = body.sessionId || "default-session";

    await supabase.from("chat_history").insert({
      session_id: sessionId,
      role: "user",
      content: userMessage,
      team_slug: teamSlug,
    });

    const settings = await getBusinessInfo();

    const systemPrompt = `
${settings?.system_prompt || "You are BookingAgent Pro, a helpful booking assistant."}

Business information:
${settings?.knowledge_base || ""}

Opening hours:
${settings?.opening_hours || ""}

Mode:
${settings?.mode || "full_booking"}

Rules:
- Detect the user's language and reply in the same language.
- Before creating a booking, collect service name, customer name, customer email, date, and time.
- Always check availability before creating a booking.
- If mode is info_only, do not create bookings.
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4.1-mini",
      messages: [
        { role: "system", content: systemPrompt },
        ...(body.history || []).map((m: any) => ({
          role: m.role,
          content: m.content,
        })),
        { role: "user", content: userMessage },
      ],
      tools: [
        {
          type: "function",
          function: {
            name: "get_business_info",
            description: "Get business information and FAQ knowledge base.",
            parameters: {
              type: "object",
              properties: {},
            },
          },
        },
        {
          type: "function",
          function: {
            name: "check_availability",
            description: "Check available appointment slots for a date.",
            parameters: {
              type: "object",
              properties: {
                date: {
                  type: "string",
                  description: "Date in YYYY-MM-DD format.",
                },
              },
              required: ["date"],
            },
          },
        },
        {
          type: "function",
          function: {
            name: "create_booking",
            description: "Create a confirmed booking after user confirmation.",
            parameters: {
              type: "object",
              properties: {
                service_name: { type: "string" },
                customer_name: { type: "string" },
                customer_email: { type: "string" },
                customer_phone: { type: "string" },
                date: { type: "string" },
                time: { type: "string" },
                notes: { type: "string" },
              },
              required: [
                "service_name",
                "customer_name",
                "customer_email",
                "date",
                "time",
              ],
            },
          },
        },
      ],
      tool_choice: "auto",
    });

    const firstMessage = completion.choices[0].message;

    let finalReply = firstMessage.content || "";

    if (firstMessage.tool_calls?.length) {
      const toolMessages: any[] = [];

      for (const toolCall of firstMessage.tool_calls) {
        const call: any = toolCall;
        const args = JSON.parse(call.function?.arguments || "{}");
      
        let result;
      
        if (call.function?.name === "get_business_info") {
          result = await getBusinessInfo();
        }
      
        if (call.function?.name === "check_availability") {
          result = await checkAvailability(args.date);
        }
      
        if (call.function?.name === "create_booking") {
          result = await createBooking(args);
        }
      
        toolMessages.push({
          role: "tool",
          tool_call_id: call.id,
          content: JSON.stringify(result),
        });
      }

      const secondCompletion = await openai.chat.completions.create({
        model: "gpt-4.1-mini",
        messages: [
          { role: "system", content: systemPrompt },
          ...(body.history || []).map((m: any) => ({
            role: m.role,
            content: m.content,
          })),
          { role: "user", content: userMessage },
          firstMessage,
          ...toolMessages,
        ],
      });

      finalReply =
        secondCompletion.choices[0].message.content ||
        "I completed the request.";
    }

    await supabase.from("chat_history").insert({
      session_id: sessionId,
      role: "assistant",
      content: finalReply,
      team_slug: teamSlug,
    });

    return {
      statusCode: 200,
      body: JSON.stringify({
        reply: finalReply,
      }),
    };
  } catch (error: any) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: error.message,
        reply:
          "Sorry, something went wrong with the booking assistant. Please try again.",
      }),
    };
  }
};