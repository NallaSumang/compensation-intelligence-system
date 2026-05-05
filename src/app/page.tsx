import prisma from "@/lib/prisma";
import { SalaryForm } from "@/components/SalaryForm";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

function formatCurrency(value: number | null | undefined): string {
  if (value === null || value === undefined || value === 0) return "-";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

export default async function Home() {
  // Fetch salaries ordered by totalComp descending, limited to 50
  const salaries = await prisma.salary.findMany({
    orderBy: {
      totalComp: "desc",
    },
    take: 50,
  });

  return (
    <div className="container mx-auto py-10 space-y-10">
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold tracking-tight">Compensation Intelligence System</h1>
        <p className="text-muted-foreground text-lg">
          Submit and view normalized tech salaries with strict server-side validation.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Submit Salary</CardTitle>
              <CardDescription>All fields will be validated and math computed on the server.</CardDescription>
            </CardHeader>
            <CardContent>
              <SalaryForm />
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Top Compensations</CardTitle>
              <CardDescription>Top 50 salaries ranked by Total Compensation.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Company</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Level</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead className="text-right">YOE</TableHead>
                      <TableHead className="text-right">Base</TableHead>
                      <TableHead className="text-right">Bonus</TableHead>
                      <TableHead className="text-right">Stock</TableHead>
                      <TableHead className="text-right font-bold text-primary">Total Comp</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {salaries.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={9} className="text-center py-6 text-muted-foreground">
                          No salary data found. Be the first to submit!
                        </TableCell>
                      </TableRow>
                    ) : (
                      salaries.map((salary) => (
                        <TableRow key={salary.id}>
                          <TableCell className="font-medium">{salary.companyNormalized}</TableCell>
                          <TableCell>{salary.role}</TableCell>
                          <TableCell>{salary.level}</TableCell>
                          <TableCell>{salary.location}</TableCell>
                          <TableCell className="text-right">{salary.yoe}</TableCell>
                          <TableCell className="text-right">{formatCurrency(salary.baseSalary)}</TableCell>
                          {/* Defensive rendering for optional fields */}
                          <TableCell className="text-right text-muted-foreground">{formatCurrency(salary.bonus)}</TableCell>
                          <TableCell className="text-right text-muted-foreground">{formatCurrency(salary.stock)}</TableCell>
                          <TableCell className="text-right font-bold text-primary">{formatCurrency(salary.totalComp)}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
