import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import OtpModal from '@/components/otp-modal'

describe('OtpModal', () => {
  test('renders and allows resend up to limit and verify', async () => {
    const onVerify = jest.fn().mockResolvedValue(undefined)
    const onResend = jest.fn().mockResolvedValue(undefined)

    const { rerender } = render(
      <OtpModal open={true} onOpenChange={() => {}} phone="+97612345678" onVerify={onVerify} onResend={onResend} cooldownSeconds={1} />
    )

    // Input should be present
    const input = screen.getByPlaceholderText('000000') as HTMLInputElement
    expect(input).toBeInTheDocument()

    // Click resend immediately (cooldown 1s), first call should be blocked by cooldown UI until seconds elapse
    const resendBtn = screen.getByRole('button', { name: /Дахин илгээх/i })
    // Initially since cooldownSeconds is 1, button should be disabled
    expect(resendBtn).toBeDisabled()

    // Wait for cooldown to expire
    await waitFor(() => expect(resendBtn).not.toBeDisabled(), { timeout: 1500 })

    // Click resend up to limit
    fireEvent.click(resendBtn)
    await waitFor(() => expect(onResend).toHaveBeenCalledTimes(1))

    // After resend, button disabled again due to cooldown
    expect(resendBtn).toBeDisabled()

    // Wait and click resend two more times
    await waitFor(() => expect(resendBtn).not.toBeDisabled(), { timeout: 1500 })
    fireEvent.click(resendBtn)
    await waitFor(() => expect(onResend).toHaveBeenCalledTimes(2))

    await waitFor(() => expect(resendBtn).not.toBeDisabled(), { timeout: 1500 })
    fireEvent.click(resendBtn)
    await waitFor(() => expect(onResend).toHaveBeenCalledTimes(3))

    // Now attempts should be at limit; clicking should not call again
    await waitFor(() => expect(resendBtn).toBeDisabled(), { timeout: 1500 })

    // Enter invalid otp and try verify -> should not call onVerify because length != 6
    fireEvent.change(input, { target: { value: '123' } })
    const verifyBtn = screen.getByRole('button', { name: /Баталгаажуул/i })
    fireEvent.click(verifyBtn)
    expect(onVerify).toHaveBeenCalledTimes(0)

    // Enter valid otp
    fireEvent.change(input, { target: { value: '123456' } })
    fireEvent.click(verifyBtn)
    await waitFor(() => expect(onVerify).toHaveBeenCalledWith('123456'))
  })
})
