export type Task = {
    id: string;
    type: "task_upload";
    status: "pending" | "running" | "complete" | "failed" | "cancelled";
    content: Record<string, any>;
};
