import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Mail, Phone, User, MessageSquare } from "lucide-react";
import { sendEmail } from "@/lib/emailService";

const inquirySchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(9, "Phone must be at least 10 digits"),
  subject: z.string().min(5, "Subject must be at least 5 characters"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

type InquiryForm = z.infer<typeof inquirySchema>;

export default function Inquiry() {
  const [sending, setSending] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<InquiryForm>({
    resolver: zodResolver(inquirySchema),
  });

  const onSubmit = async (data: InquiryForm) => {
    setSending(true);
    try {
      // Send to admin
      const adminResult = await sendEmail({
        templateId: import.meta.env.VITE_EMAILJS_ADMIN_TEMPLATE_ID,
        data: {
          from_name: data.name,
          from_email: data.email,
          from_phone: data.phone,
          subject: data.subject,
          message: data.message,
        },
      });

      // Send auto-reply to user
      const userResult = await sendEmail({
        templateId: import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
        data: {
          from_name: data.name,
          from_email: data.email,
          subject: data.subject,
          message: data.message,
        },
      });

      if (adminResult.success && userResult.success) {
        toast.success("Inquiry sent successfully!");
        reset();
      } else {
        toast.error("Failed to send inquiry. Please try again.");
      }
    } catch (error) {
      console.error("EmailJS Error:", error);
      toast.error("Failed to send inquiry. Please try again.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="container mx-auto max-w-2xl py-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Contact Inquiry</CardTitle>
          <CardDescription>
            Fill out the form below and we'll get back to you as soon as possible.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name" className="flex items-center gap-2">
                <User className="w-4 h-4" />
                Name
              </Label>
              <Input
                id="name"
                placeholder="John Doe"
                {...register("name")}
                className={errors.name ? "border-red-500" : ""}
              />
              {errors.name && (
                <p className="text-sm text-red-500">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="john@example.com"
                {...register("email")}
                className={errors.email ? "border-red-500" : ""}
              />
              {errors.email && (
                <p className="text-sm text-red-500">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone" className="flex items-center gap-2">
                <Phone className="w-4 h-4" />
                Phone Number
              </Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+1 234 567 8900"
                {...register("phone")}
                className={errors.phone ? "border-red-500" : ""}
              />
              {errors.phone && (
                <p className="text-sm text-red-500">{errors.phone.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="subject" className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4" />
                Subject
              </Label>
              <Input
                id="subject"
                placeholder="What is this regarding?"
                {...register("subject")}
                className={errors.subject ? "border-red-500" : ""}
              />
              {errors.subject && (
                <p className="text-sm text-red-500">{errors.subject.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="message">Message</Label>
              <Textarea
                id="message"
                placeholder="Tell us more about your inquiry..."
                rows={6}
                {...register("message")}
                className={errors.message ? "border-red-500" : ""}
              />
              {errors.message && (
                <p className="text-sm text-red-500">{errors.message.message}</p>
              )}
            </div>

            <Button type="submit" className="w-full" disabled={sending}>
              {sending ? "Sending..." : "Send Inquiry"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}