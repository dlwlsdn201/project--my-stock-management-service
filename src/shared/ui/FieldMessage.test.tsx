import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { FieldMessage } from './FieldMessage';

describe('FieldMessage', () => {
  it('uses destructive token class for error tone', () => {
    render(<FieldMessage tone="error">오류</FieldMessage>);
    expect(screen.getByRole('alert')).toHaveClass('text-[hsl(var(--destructive))]');
  });

  it('uses success token class for success tone', () => {
    render(<FieldMessage tone="success">성공</FieldMessage>);
    expect(screen.getByText('성공')).toHaveClass('text-[hsl(var(--success))]');
  });

  it('uses muted-foreground token class for info tone', () => {
    render(<FieldMessage tone="info">안내</FieldMessage>);
    expect(screen.getByText('안내')).toHaveClass('text-[hsl(var(--muted-foreground))]');
  });

  it('error tone renders role="alert"', () => {
    render(<FieldMessage tone="error">오류</FieldMessage>);
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('success tone does not render role="alert"', () => {
    render(<FieldMessage tone="success">성공</FieldMessage>);
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('forwards id prop for aria-describedby linkage', () => {
    render(<FieldMessage id="field-msg" tone="error">오류</FieldMessage>);
    expect(screen.getByRole('alert')).toHaveAttribute('id', 'field-msg');
  });
});
