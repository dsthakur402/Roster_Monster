
import { addDays, isWeekend } from "date-fns"

export interface Holiday {
  date: Date
  name: string
  type: "Public" | "Bank" | "School"
}

export const getSingaporeHolidays = (year: number): Holiday[] => {
  return [
    { date: new Date(year, 0, 1), name: "New Year's Day", type: "Public" },
    { date: new Date(year, 1, 10), name: "Chinese New Year", type: "Public" },
    { date: new Date(year, 1, 11), name: "Chinese New Year", type: "Public" },
    { date: new Date(year, 3, 7), name: "Good Friday", type: "Public" },
    { date: new Date(year, 4, 1), name: "Labour Day", type: "Public" },
    { date: new Date(year, 4, 15), name: "Vesak Day", type: "Public" },
    { date: new Date(year, 5, 29), name: "Hari Raya Puasa", type: "Public" },
    { date: new Date(year, 7, 9), name: "National Day", type: "Public" },
    { date: new Date(year, 8, 31), name: "Hari Raya Haji", type: "Public" },
    { date: new Date(year, 10, 12), name: "Deepavali", type: "Public" },
    { date: new Date(year, 11, 25), name: "Christmas Day", type: "Public" },
  ]
}

export const isHoliday = (date: Date, holidays: Holiday[]): boolean => {
  return holidays.some(holiday => 
    holiday.date.getDate() === date.getDate() &&
    holiday.date.getMonth() === date.getMonth() &&
    holiday.date.getFullYear() === date.getFullYear()
  )
}

export const isWeekendOrHoliday = (date: Date, holidays: Holiday[]): boolean => {
  return isWeekend(date) || isHoliday(date, holidays)
}

export const getNextSixMonths = (): Date[] => {
  const dates: Date[] = []
  const startDate = new Date()
  
  for (let i = 0; i < 180; i++) {
    dates.push(addDays(startDate, i))
  }
  
  return dates
}
