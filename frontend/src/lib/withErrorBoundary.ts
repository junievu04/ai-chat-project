import { getURLFromRedirectError } from "next/dist/client/components/redirect";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { notFound, redirect } from "next/navigation";
import "server-only";

type AsyncComponent<P> = (props: P) => Promise<React.JSX.Element>;

const withErrorBoundary = <P>(
  Component: AsyncComponent<P>,
): AsyncComponent<P> => {
  return async (props: P) => {
    try {
      return await Component(props);
    } catch (error) {
      if (isRedirectError(error)) {
        redirect(getURLFromRedirectError(error));
      }
      notFound();
    }
  };
};

export default withErrorBoundary;
