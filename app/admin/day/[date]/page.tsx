import { notFound } from "next/navigation";
import { getDay } from "@/lib/data";
import { isValidISODate } from "@/lib/date";
import { DayDetailView } from "@/components/day-detail-view";

export default async function AdminDayPage({
  params,
}: {
  params: Promise<{ date: string }>;
}) {
  const { date } = await params;
  if (!isValidISODate(date)) notFound();

  const record = await getDay(date);

  return (
    <DayDetailView
      record={record}
      role="admin"
      backHref={`/admin/calendar?m=${date.slice(0, 7)}`}
    />
  );
}
