
export const dynamic = "force-dynamic";



import prisma from "@/lib/prisma";

import { CompareClient } from "@/components/CompareClient";



export default async function ComparePage() {

  // Fetch all salaries to populate the selection combo boxes

  // In a massive production app, we would use an autocomplete API, but for this PRD we pass them to the client

  const salaries = await prisma.salary.findMany({

    orderBy: {

      companyNormalized: "asc",

    },

  });



  return (

    <div className="container mx-auto py-10 space-y-10">

      <div className="text-center space-y-2">

        <h1 className="text-4xl font-bold tracking-tight">Delta Engine</h1>

        <p className="text-muted-foreground text-lg">

          Select two salaries to instantly calculate the percentage delta across all compensation metrics.

        </p>

      </div>



      <CompareClient salaries={salaries} />

    </div>

  );

}

