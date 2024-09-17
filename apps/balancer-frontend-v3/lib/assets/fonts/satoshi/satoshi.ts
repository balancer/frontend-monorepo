import localFont from 'next/font/local'

export const satoshiFont = localFont({
  src: [
    {
      path: './Satoshi-Regular.woff2',
      weight: '400',
      style: 'normal',
    },
    {
      path: './Satoshi-Italic.woff2',
      weight: '400',
      style: 'italic',
    },
    {
      path: './Satoshi-Medium.woff2',
      weight: '500',
      style: 'normal',
    },
    {
      path: './Satoshi-MediumItalic.woff2',
      weight: '500',
      style: 'italic',
    },
    {
      path: './Satoshi-Bold.woff2',
      weight: '700',
      style: 'normal',
    },
    {
      path: './Satoshi-BoldItalic.woff2',
      weight: '700',
      style: 'italic',
    },
    {
      path: './Satoshi-Light.woff2',
      weight: '300',
      style: 'normal',
    },
    {
      path: './Satoshi-LightItalic.woff2',
      weight: '300',
      style: 'italic',
    },
  ],
})
