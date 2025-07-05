export const addSeconds = (date: Date | string, seconds: number): Date => {
    const newDate = new Date(date);
    newDate.setSeconds(newDate.getSeconds() + seconds);
    return newDate;
};

export const addMinute = (date: Date | string, minute: number): Date => {
    const newDate = new Date(date);
    newDate.setMinutes(newDate.getMinutes() + minute);
    return newDate;
};

export const addDays = (date: Date | string, days: number): Date => {
    const newDate = new Date(date);
    newDate.setDate(newDate.getDate() + days);
    return newDate;
};

export const addMonths = (date: Date | string, months: number): Date => {
    const newDate = new Date(date);
    newDate.setMonth(newDate.getMonth() + months);
    return newDate;
};

export const converToLocalTime = (serverDate: Date): string => {
    const dateStr = serverDate.getFullYear() + "-" + 
                   (serverDate.getMonth() + 1) + "-" + 
                   serverDate.getDate() + " " + 
                   serverDate.getHours() + ":" + 
                   String(serverDate.getMinutes()).padStart(2, '0') + ":" + 
                   String(serverDate.getSeconds()).padStart(2, '0');
    return dateStr;
};