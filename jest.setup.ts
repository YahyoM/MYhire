import "@testing-library/jest-dom";
import React, { forwardRef } from "react";

type MockMotionProps = React.HTMLAttributes<HTMLDivElement> & {
	animate?: unknown;
	initial?: unknown;
	exit?: unknown;
	layout?: unknown;
	transition?: unknown;
	whileHover?: unknown;
	whileTap?: unknown;
	variants?: unknown;
};

const MockMotionComponent = forwardRef<HTMLDivElement, MockMotionProps>(
	({ children, ...rest }, ref) =>
		React.createElement("div", { ...rest, ref }, children as React.ReactNode),
);

MockMotionComponent.displayName = "MockMotionComponent";

jest.mock("framer-motion", () => ({
	motion: new Proxy(
		{},
		{
			get: () => MockMotionComponent,
		},
	),
	AnimatePresence: ({ children }: { children?: React.ReactNode }) =>
		React.createElement(React.Fragment, null, children),
}));
