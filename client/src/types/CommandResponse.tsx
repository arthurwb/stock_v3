export interface CommandResponse {
    type: "warning" | "output",
    message: string,
    content: React.ReactNode | null
}