import PropTypes from 'prop-types'
import { useToast } from "@/hooks/use-toast"
export { useToast }
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast"

export function Toaster() {
  const { toasts } = useToast()

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, ...props }) {
        return (
          <Toast key={id} {...props}>
            <div className="grid gap-1">
              {title && <ToastTitle>{title}</ToastTitle>}
              {description && (
                <ToastDescription>{description}</ToastDescription>
              )}
            </div>
            {action}
            <ToastClose />
          </Toast>
        )
      })}
      <ToastViewport />
    </ToastProvider>
  )
}

Toaster.propTypes = {
  // While Toaster itself doesn't take direct props, we define PropTypes for the expected
  // shape of the toast items it renders internally from useToast
  toasts: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      title: PropTypes.string,
      description: PropTypes.string,
      action: PropTypes.node,
      // Additional toast props inherited from Toast component
      variant: PropTypes.oneOf(['default', 'destructive']),
      className: PropTypes.string
    })
  )
}
export { Toast, ToastClose, ToastDescription, ToastProvider, ToastTitle, ToastViewport } from "@/components/ui/toast";