import React, { useRef, useState } from "react";
import "./ErrorContent.css";
import { ReactComponent as Warning } from "./Warning.svg";

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
