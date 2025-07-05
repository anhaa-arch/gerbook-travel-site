import { Model } from 'mongoose';

interface Pagination {
  total: number;
  pageCount: number;
  start: number;
  end: number;
  limit: number;
  nextPage?: number;
  prevPage?: number;
}

export default async function pagination<T>(
  page: number, 
  limit: number, 
  model: Model<T>
): Promise<Pagination> {
  const total = await model.countDocuments();
  const pageCount = Math.ceil(total / limit);
  const start = (page - 1) * limit + 1;
  let end = start + limit - 1;
  if (end > total) end = total;

  const pagination: Pagination = { total, pageCount, start, end, limit };

  if (page < pageCount) pagination.nextPage = page + 1;
  if (page > 1) pagination.prevPage = page - 1;

  return pagination;
}