import React from "react";
import "./ErrorContent.css";
import Warning from "./Warning.svg?react";

export type ErrorContentProps = {
  title: string;
  children: React.ReactNode;
};

export function ErrorContent({
  title,
  children,
}: ErrorContentProps): JSX.Element {
  return (
    <div className="container">
      <Warning fill="#f24822" scale={1} strokeWidth={0} />
      <h1>{title}</h1>
      {children}
    </div>
  );
}
