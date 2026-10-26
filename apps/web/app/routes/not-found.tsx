import { data } from 'react-router';

export function clientLoader() {
  // eslint-disable-next-line @typescript-eslint/only-throw-error -- React Router's idiom for a 404 response
  throw data(null, { status: 404 });
}

export default function NotFound() {
  return null;
}
