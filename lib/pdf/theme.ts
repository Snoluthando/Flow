// PDF colours. @react-pdf/renderer can't read CSS variables, so the invoice
// PDF has its own palette here. The PDF is always "paper" (light), so it does
// not follow the app's dark mode. Change a value here to restyle the PDF only.
export const PDF_COLORS = {
  text: "#17233b",
  textMuted: "#4a5468",
  line: "#e2e0d8",
  defaultAccent: "#2f6f5e",
} as const;
