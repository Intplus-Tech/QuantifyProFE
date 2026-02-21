"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  HelpCircle,
  MessageCircle,
} from "lucide-react";

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
    color: "text-orange-500",
    bg: "bg-orange-50",
  },
];

const faqs = [
  {
    question: "How do I create a new project and start measuring?",
    answer:
      "To create a new project, navigate to the Projects page and click 'Create New Project'. Upload your drawings (PDF, DWG, or image formats), and Quantify Pro's AI will automatically detect and measure quantities. You can then review and adjust measurements as needed.",
  },
  {
    question: "Can I export my BOQ to Excel or PDF?",
    answer:
      "Yes! Quantify Pro supports exporting BOQs to Excel (.xlsx), PDF, and CSV formats. Go to your project, select the BOQ tab, and click the Export button to choose your preferred format.",
  },
  {
    question: "What file formats are supported for drawing uploads?",
    answer:
      "Quantify Pro supports PDF, DWG, DXF, PNG, JPG, and TIFF formats. For best results, we recommend uploading high-resolution PDFs of your construction drawings.",
  },
  {
    question: "How does AI-powered quantity take-off work?",
    answer:
      "Our AI analyzes your uploaded drawings to automatically detect and measure construction elements like walls, floors, doors, and windows. It uses computer vision and machine learning to identify patterns and calculate quantities with high accuracy.",
  },
];

export default function HelpSupport() {
  return (
    <div className="space-y-6">
      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary via-amber-400 to-primary p-8 text-white">
        <div className="relative z-10 max-w-2xl">
          <div className="flex  mb-3"></div>
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
        {/* Background decoration */}
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
              <h3 className="font-bold text-foreground text-sm mb-1 group-hover:text-orange-500 transition-colors">
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
          <div className="border-none drop-shadow-none p-0">
            <div className="pb-4">
              <div className="flex items-center gap-3">
                <MessageCircle className="w-5 h-5 text-orange-500" />
                <CardTitle className="text-lg font-bold text-foreground">
                  Frequently Asked Questions
                </CardTitle>
              </div>
            </div>
            <div>
              <Accordion
                type="single"
                collapsible
                className="w-full bg-transparent border-none p-4"
              >
                {faqs.map((faq, idx) => (
                  <AccordionItem
                    key={idx}
                    value={`item-${idx}`}
                    className="pb-8 rounded-2xl pt-4 px-4 border mb-4"
                  >
                    <AccordionTrigger className="text-sm font-semibold text-foreground rounded-2xl last:border text-left hover:text-primary">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-sm text-muted-foreground leading-relaxed pb-8">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </div>
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
                  Our dedicated support team is here to help you with any issues
                  or questions.
                </p>
              </div>
              <div className="space-y-3">
                <Button size={"lg"} className="w-full py-6 rounded-full">
                  <Mail className="w-4 h-4 mr-2" />
                  Contact Support
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Average response time: <strong>2 hours</strong>
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
