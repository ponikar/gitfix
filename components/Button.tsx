import React, { ReactNode } from "react";
import {
  ActivityIndicator,
  Pressable,
  PressableProps,
  Text,
  TextProps,
  View,
} from "react-native";

type ButtonVariant = "primary" | "secondary" | "outline" | "danger" | "ghost";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonContextType {
  variant: ButtonVariant;
  size: ButtonSize;
  isLoading?: boolean;
}

const ButtonContext = React.createContext<ButtonContextType | undefined>(
  undefined
);

const useButtonContext = () => {
  const context = React.useContext(ButtonContext);
  if (!context) {
    throw new Error(
      "Button sub-components must be used within Button component"
    );
  }
  return context;
};

const variantStyles: Record<ButtonVariant, string> = {
  primary: "bg-slate-800 active:bg-blue-600 disabled:bg-slate-500",
  secondary: "bg-gray-200 active:bg-gray-300 disabled:bg-gray-100",
  outline:
    "border-2 border-blue-500 active:bg-blue-50 disabled:border-blue-300",
  danger: "bg-red-500 active:bg-red-600 disabled:bg-red-300",
  ghost: "active:bg-gray-100 disabled:opacity-50",
};

const textColorStyles: Record<ButtonVariant, string> = {
  primary: "text-white",
  secondary: "text-black",
  outline: "text-blue-500",
  danger: "text-white",
  ghost: "text-black",
};

const sizeStyles: Record<ButtonSize, { container: string; text: string }> = {
  sm: {
    container: "px-2 py-1 rounded-md",
    text: "text-sm font-medium",
  },
  md: {
    container: "px-3 py-2 rounded-md",
    text: "text-base font-semibold",
  },
  lg: {
    container: "px-4 py-3 rounded-lg",
    text: "text-lg font-bold",
  },
};

interface ButtonProps extends PressableProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  children: ReactNode;
}

export const Button = React.forwardRef<any, ButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      isLoading = false,
      disabled,
      className = "",
      children,
      ...props
    },
    ref
  ) => {
    const variantStyle = variantStyles[variant];
    const sizeStyle = sizeStyles[size];

    return (
      <ButtonContext.Provider value={{ variant, size, isLoading }}>
        <Pressable
          ref={ref}
          disabled={disabled || isLoading}
          className={`flex-row items-center justify-center gap-2 ${sizeStyle.container} ${variantStyle} ${className}`}
          {...props}
        >
          {isLoading ? (
            <ActivityIndicator
              color={
                variant === "secondary" ||
                variant === "outline" ||
                variant === "ghost"
                  ? "#000"
                  : "#fff"
              }
              size={size === "lg" ? "large" : "small"}
            />
          ) : typeof children === "string" ? (
            <Text className={`${sizeStyle.text} ${textColorStyles[variant]}`}>
              {children}
            </Text>
          ) : (
            children
          )}
        </Pressable>
      </ButtonContext.Provider>
    );
  }
);

Button.displayName = "Button";

interface ButtonIconProps {
  children: ReactNode;
}

export const ButtonIcon = ({ children }: ButtonIconProps) => {
  const { size } = useButtonContext();

  const sizeMap = {
    sm: 16,
    md: 18,
    lg: 24,
  };

  return (
    <View>
      {React.isValidElement(children)
        ? React.cloneElement(children as React.ReactElement<any>, {
            size: sizeMap[size],
          })
        : children}
    </View>
  );
};

ButtonIcon.displayName = "ButtonIcon";

interface ButtonTextProps extends TextProps {
  children: string;
}

export const ButtonText = ({
  children,
  className,
  ...props
}: ButtonTextProps) => {
  const { variant, size } = useButtonContext();
  const sizeStyle = sizeStyles[size];

  return (
    <Text
      {...props}
      className={`${sizeStyle.text} ${textColorStyles[variant]} ${className}`}
    >
      {children}
    </Text>
  );
};

ButtonText.displayName = "ButtonText";

interface ButtonGroupProps {
  children: ReactNode;
  className?: string;
}

export const ButtonGroup = ({ children, className = "" }: ButtonGroupProps) => {
  return <View className={`flex-row gap-2 ${className}`}>{children}</View>;
};

ButtonGroup.displayName = "ButtonGroup";
