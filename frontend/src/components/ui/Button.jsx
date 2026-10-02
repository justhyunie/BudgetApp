import Button from "@mui/material/Button";

export default function AppButton({
  children,
  variant = "primary",
  ...props
}) {
  return (
    <Button
      variant={variant === "primary" ? "contained" : "outlined"}
      {...props}
    >
      {children}
    </Button>
  );
}