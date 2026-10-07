'use client';

import React from 'react';
import AnimatedHeading, { AnimatedHeadingProps } from './AnimatedHeading';

export type TypewriterHeadingProps = AnimatedHeadingProps;

export const TypewriterHeading = (props: TypewriterHeadingProps) => {
  return <AnimatedHeading {...props} />;
};

export default TypewriterHeading;
