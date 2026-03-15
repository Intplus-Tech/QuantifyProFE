"use client";

import { useState } from "react";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Search,
  BookOpen,
  CreditCard,
  Ruler,
  FileOutput,
  Mail,
  MessageCircle,
} from "lucide-react";
import { SupportTicketModal } from "./SupportTicketModal";

const helpTopics = [
  {
    icon: BookOpen,
    title: "Getting Started",
    description: "Learn the basics of Quantify Pro and set up your workspace",
    color: "text-blue-500",
    bg: "bg-blue-50",
  },
  {
    icon: CreditCard,
    title: "Billing & Plans",
    description: "Manage subscriptions, payments, and invoices",
    color: "text-emerald-500",
    bg: "bg-emerald-50",
  },
  {
    icon: Ruler,
    title: "AI Measurements",
    description: "Accurate quantity take-offs using AI-powered tools",
    color: "text-purple-500",
    bg: "bg-purple-50",
  },
  {
    icon: FileOutput,
    title: "Exporting Data",
    description: "Export BOQs, reports, and project data in multiple formats",
    color: "text-primary",
    bg: "bg-primary/10",
  },
];

const faqs = [
  {
    question: "How accurate is the AI measurement tool?",
    answer:
      "Our AI measurement tool achieves up to 98% accuracy on standard CAD and PDF drawings. However, we always recommend a quick review of the highlighted areas to ensure all project-specific nuances are captured correctly.",
  },
  {
    question: "Can I collaborate with other surveyors?",
    answer:
      "Yes! Quantify Pro supports real-time collaboration. You can invite team members to your projects, assign roles, and work simultaneously on the same BOQ with live updates.",
  },
  {
    question: "What file formats are supported for uploads?",
    answer:
      "Quantify Pro supports PDF, DWG, DXF, PNG, JPG, and TIFF formats. For best results, we recommend uploading high-resolution PDFs of your construction drawings.",
  },
  {
    question: "How do I upgrade my Solo plan?",
    answer:
      "You can upgrade your plan from the Settings → Billing & Subscription tab. Choose the plan that fits your team size and click Upgrade. Changes take effect immediately.",
  },
];

export default function HelpSupport() {
  const [ticketOpen, setTicketOpen] = useState(false);

  return (
    <>
      <div className="space-y-6">
        {/* Hero Banner */}
        <div className="relative overflow-hidden rounded-2xl bg-linear-to-r from-primary via-amber-400 to-primary p-8 text-white">
          <div className="relative z-10 max-w-2xl">
            <h2 className="text-4xl font-bold mb-2">
              How can we help you today?
            </h2>
            <p className="text-white/80 text-sm mb-5">
              Search our knowledge base or browse common topics below
            </p>
            <div className="relative max-w-lg">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-orange-300" />
              <Input
                placeholder="Search for help articles, tutorials, FAQs..."
                className="pl-12 bg-white border-white text-foreground placeholder:text-foreground h-12 rounded-xl focus-visible:ring-white/50"
              />
            </div>
          </div>
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
        </div>

        {/* Help Topics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {helpTopics.map((topic, idx) => (
            <Card
              key={idx}
              className="shadow-sm border-border/50 hover:shadow-md transition-shadow cursor-pointer group"
            >
              <CardContent className="p-5">
                <div
                  className={`w-10 h-10 rounded-lg ${topic.bg} flex items-center justify-center mb-3`}
                >
                  <topic.icon className={`w-5 h-5 ${topic.color}`} />
                </div>
                <h3 className="font-bold text-foreground text-sm mb-1 group-hover:text-primary transition-colors">
                  {topic.title}
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {topic.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* FAQ Section */}
          <div className="lg:col-span-2">
            <Card className="shadow-sm border-border/50">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-5">
                  <MessageCircle className="w-5 h-5 text-primary" />
                  <CardTitle className="text-lg font-bold text-foreground">
                    Frequently Asked Questions
                  </CardTitle>
                </div>
                <Accordion type="single" collapsible className="w-full space-y-3">
                  {faqs.map((faq, idx) => (
                    <AccordionItem
                      key={idx}
                      value={`item-${idx}`}
                      className="border border-border/50 rounded-xl px-4 bg-white"
                    >
                      <AccordionTrigger className="text-sm font-semibold text-foreground text-left hover:text-primary hover:no-underline py-4">
                        {faq.question}
                      </AccordionTrigger>
                      <AccordionContent className="text-sm text-muted-foreground leading-relaxed pb-4">
                        {faq.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>
          </div>

          {/* Contact Support */}
          <div>
            <Card className="shadow-sm border-border/50 bg-slate-50/80">
              <CardContent className="p-6 text-center space-y-4">
                <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                  <Mail className="w-7 h-7 text-primary" />
                </div>
                <div>
                  <h3 className="font-bold text-foreground text-lg mb-1">
                    Contact Support
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Our dedicated support team is here to help you with any
                    issues or questions.
                  </p>
                </div>
                <Button
                  size="lg"
                  className="w-full py-6 rounded-full"
                  onClick={() => setTicketOpen(true)}
                >
                  <Mail className="w-4 h-4 mr-2" />
                  Contact Support
                </Button>
                <p className="text-xs text-muted-foreground">
                  Average response time: <strong>2 hours</strong>
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <SupportTicketModal open={ticketOpen} onOpenChange={setTicketOpen} />
    </>
  );
}
