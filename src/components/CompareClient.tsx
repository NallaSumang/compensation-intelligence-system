"use client";

import { useState } from "react";
import { Salary } from "@prisma/client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface CompareClientProps {
  salaries: Salary[];
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

function calculateDelta(valueA: number, valueB: number): { text: string; colorClass: string } {
  if (valueA === 0 && valueB === 0) {
    return { text: "0%", colorClass: "text-muted-foreground" };
  }
  if (valueA === 0 && valueB > 0) {
    return { text: "New Grant", colorClass: "text-green-600" };
  }
  if (valueA > 0 && valueB === 0) {
    return { text: "-100%", colorClass: "text-red-600" };
  }

  const delta = ((valueB - valueA) / valueA) * 100;
  const isPositive = delta > 0;
  const formattedText = `${isPositive ? "+" : ""}${delta.toFixed(1)}%`;

  if (delta === 0) return { text: "0%", colorClass: "text-muted-foreground" };
  return {
    text: formattedText,
    colorClass: isPositive ? "text-green-600 font-bold" : "text-red-600 font-bold",
  };
}

export function CompareClient({ salaries }: CompareClientProps) {
  const [salaryAId, setSalaryAId] = useState<string>("");
  const [salaryBId, setSalaryBId] = useState<string>("");

  const salaryA = salaries.find((s) => s.id === salaryAId);
  const salaryB = salaries.find((s) => s.id === salaryBId);

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Salary A</CardTitle>
          </CardHeader>
          <CardContent>
            <Select onValueChange={setSalaryAId} value={salaryAId}>
              <SelectTrigger>
                <SelectValue placeholder="Select a salary to compare" />
              </SelectTrigger>
              <SelectContent>
                {salaries.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.companyNormalized} - {s.role} ({s.level}) - {formatCurrency(s.totalComp)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Salary B</CardTitle>
          </CardHeader>
          <CardContent>
            <Select onValueChange={setSalaryBId} value={salaryBId}>
              <SelectTrigger>
                <SelectValue placeholder="Select a salary to compare" />
              </SelectTrigger>
              <SelectContent>
                {salaries.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.companyNormalized} - {s.role} ({s.level}) - {formatCurrency(s.totalComp)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>
      </div>

      {salaryA && salaryB && (
        <Card className="mt-8 border-primary/20 shadow-lg">
          <CardHeader className="text-center bg-muted/50">
            <CardTitle className="text-2xl">Delta Comparison</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="grid grid-cols-4 gap-4 p-6 items-center text-center">
              <div className="font-semibold text-muted-foreground">Metric</div>
              <div className="font-bold">{salaryA.companyNormalized}</div>
              <div className="font-bold">{salaryB.companyNormalized}</div>
              <div className="font-bold text-primary">Delta (B vs A)</div>

              {/* Base Salary */}
              <div className="font-medium">Base Salary</div>
              <div>{formatCurrency(salaryA.baseSalary)}</div>
              <div>{formatCurrency(salaryB.baseSalary)}</div>
              <div className={calculateDelta(salaryA.baseSalary, salaryB.baseSalary).colorClass}>
                {calculateDelta(salaryA.baseSalary, salaryB.baseSalary).text}
              </div>

              {/* Bonus */}
              <div className="font-medium">Bonus</div>
              <div>{formatCurrency(salaryA.bonus)}</div>
              <div>{formatCurrency(salaryB.bonus)}</div>
              <div className={calculateDelta(salaryA.bonus, salaryB.bonus).colorClass}>
                {calculateDelta(salaryA.bonus, salaryB.bonus).text}
              </div>

              {/* Stock */}
              <div className="font-medium">Stock</div>
              <div>{formatCurrency(salaryA.stock)}</div>
              <div>{formatCurrency(salaryB.stock)}</div>
              <div className={calculateDelta(salaryA.stock, salaryB.stock).colorClass}>
                {calculateDelta(salaryA.stock, salaryB.stock).text}
              </div>

              <div className="col-span-4 border-t my-2" />

              {/* Total Comp */}
              <div className="font-bold text-lg">Total Comp</div>
              <div className="font-bold text-lg">{formatCurrency(salaryA.totalComp)}</div>
              <div className="font-bold text-lg">{formatCurrency(salaryB.totalComp)}</div>
              <div className={`text-lg ${calculateDelta(salaryA.totalComp, salaryB.totalComp).colorClass}`}>
                {calculateDelta(salaryA.totalComp, salaryB.totalComp).text}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
