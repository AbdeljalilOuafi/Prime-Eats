import * as React from "react"
import { cn } from "@/lib/utils"
import PropTypes from "prop-types"

const Alert = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    role="alert"
    className={cn(
      "relative w-full rounded-lg border p-4",
      className
    )}
    {...props}
  />
))
Alert.displayName = "Alert"

const AlertDescription = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("text-sm [&_p]:leading-relaxed", className)}
    {...props}
  />
))
AlertDescription.displayName = "AlertDescription"

Alert.propTypes = {
  className: PropTypes.string,
  props: PropTypes.object,
};
AlertDescription.propTypes = {
  className: PropTypes.string,
  props: PropTypes.object,
};

export { Alert, AlertDescription }