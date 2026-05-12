"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

// Schema with Coercion: Bridges the gap between HTML Input strings and Prisma numbers
const formSchema = z.object({
  companyRaw: z.string().min(1, "Company name is required"),
  role: z.string().min(1, "Role is required"),
  level: z.string().min(1, "Level is required"),
  location: z.string().min(1, "Location is required"),
  yoe: z.coerce.number().min(0, "YOE must be at least 0"),
  baseSalary: z.coerce.number().positive("Base salary is required"),
  bonus: z.coerce.number().nonnegative().default(0),
  stock: z.coerce.number().nonnegative().default(0),
});

type FormValues = z.infer<typeof formSchema>;

export function SalaryForm() {
  const [isLoading, setIsLoading] = useState(false);

  // Explicitly pass <FormValues> to ensure type safety
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema) as any, 
    defaultValues: {
      companyRaw: "",
      role: "",
      level: "",
      location: "",
      yoe: 0,
      baseSalary: 0,
      bonus: 0,
      stock: 0,
    },
  });

  async function onSubmit(values: FormValues) {
    setIsLoading(true);
    try {
      const response = await fetch("/api/salaries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      // DEFENSIVE PARSING: Prevent the "Unexpected end of JSON input" crash
      const contentType = response.headers.get("content-type");
      const isJson = contentType && contentType.includes("application/json");

      if (!response.ok) {
        if (isJson) {
          // Safe to parse as JSON
          const errorData = await response.json();
          throw new Error(errorData.error || "Submission rejected by server");
        } else {
          // It's HTML or text (e.g., Vercel 504 Timeout or 405 Method Not Allowed)
          const textError = await response.text();
          console.error("Fatal Server Error (Non-JSON):", textError);
          throw new Error(`Server crashed with status ${response.status}. Check network tab or Vercel logs.`);
        }
      }

      // Handle successful response safely
      if (isJson) {
        await response.json();
      }

      toast.success("Compensation data secured in database.");
      form.reset();
    } catch (error: any) {
      toast.error(error.message || "Network or server failure");
      console.error("Submission error details:", error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-6 bg-card rounded-xl border shadow-sm">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="companyRaw"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Company</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Google" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Role</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Software Engineer" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField
              control={form.control}
              name="level"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Level</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. L4 / Senior" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Hyderabad" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="yoe"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Years of Experience</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t pt-6">
            <FormField
              control={form.control}
              name="baseSalary"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Base Salary</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="0" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="bonus"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Annual Bonus</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="0" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="stock"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Stock (RSU/Yr)</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="0" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Validating Entry...
              </>
            ) : (
              "Submit Compensation Data"
            )}
          </Button>
        </form>
      </Form>
    </div>
  );
}
