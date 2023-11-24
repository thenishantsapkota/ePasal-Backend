export function successResponse(data: any, message: string) {
  return {
    status: 'success',
    data,
    message,
  };
}
