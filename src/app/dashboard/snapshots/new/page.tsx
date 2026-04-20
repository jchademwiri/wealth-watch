import { ArrowLeft, Camera } from "lucide-react";
import Link from "next/link";
import { getActiveAssets } from "@/actions/assets";
import { getLastValuePerAsset } from "@/actions/snapshots";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { BulkSnapshotForm } from "@/components/snapshots/BulkSnapshotForm";

export const dynamic = "force-dynamic";

export default async function NewSnapshotPage() {
  const [assets, lastValues] = await Promise.all([
    getActiveAssets(),
    getLastValuePerAsset(),
  ]);

  if (assets.length === 0) {
    return (
      <div className="p-4 md:p-6">
        <div className="mb-6 flex items-center gap-3">
          <Link
            href="/dashboard/snapshots"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h1 className="text-xl font-semibold">Weekly update</h1>
            <p className="text-sm text-muted-foreground">
              Check your broker and Luno balances, then enter current values below.
            </p>
          </div>
        </div>
        <div className="mx-auto max-w-2xl">
          <EmptyState
            icon={Camera}
            title="No active assets found."
            description="Add your first asset before recording a portfolio snapshot."
            actionHref="/dashboard/assets/new"
            actionLabel="Add your first asset →"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6">
      <div className="mb-6 flex items-center gap-3">
        <Link
          href="/"
          className="text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-xl font-semibold">Weekly update</h1>
          <p className="text-sm text-muted-foreground">
            Check your broker and Luno balances, then enter current values
            below.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-lg">
        <BulkSnapshotForm
          assets={assets}
          lastValues={lastValues}
          defaultDate={new Date().toISOString().split("T")[0]}
        />
      </div>
    </div>
  );
}
