const getFontSizeStyle = (font: number) => {
  switch (font) {
    case 1:
      return '0.75rem'
    case 2:
      return '0.875rem'
    case 3:
      return '1rem'
    default:
      return '0.75rem'
  }
}

const getFontFaimly = (font_pairing: string) => {
  if (!font_pairing) {
    return { primaryFontClass: 'nohemi', secondaryFontClass: 'inter' }
  }

  const [primaryFont, secondaryFont] = font_pairing.split(' + ')
  const primaryFontClass = primaryFont?.toLowerCase()
  const secondaryFontClass = secondaryFont?.toLowerCase()
  return { primaryFontClass, secondaryFontClass }
}

const getRadius = (radius: string) => {
  switch (radius) {
    case 'S':
      return '4px'
    case 'M':
      return '8px'
    case 'L':
      return '12px'
    case 'XL':
      return '16px'
    default:
      return '0px'
  }
}

export { getFontSizeStyle, getFontFaimly, getRadius }
