export function formatDate(
  date: Date | string | number | null | undefined,
  opts: Intl.DateTimeFormatOptions = {},
): string {
  if (date == null || date === "") return ""

  const parsedDate = new Date(date)
  if (isNaN(parsedDate.getTime())) return ""

  try {
    const formatter = new Intl.DateTimeFormat("en-US", {
      month: opts.month ?? "long",
      day: opts.day ?? "numeric",
      year: opts.year ?? "numeric",
      ...opts,
    })

    return formatter.format(parsedDate)
  } catch {
    return ""
  }
}
