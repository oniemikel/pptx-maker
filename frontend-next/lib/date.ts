import dayjs from 'dayjs';
import 'dayjs/locale/ja';

dayjs.locale('ja');

export const todayAsInput = (): string => dayjs().format('YYYY-MM-DD');

export const toDisplayDate = (value: string): string =>
  dayjs(value).format('YYYY年MM月DD日（ddd）');

export const toFilenameDate = (value: string): string =>
  dayjs(value).format('YYYYMMDD');
