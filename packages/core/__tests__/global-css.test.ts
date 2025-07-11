import { createGeneratorContext } from '@pandacss/fixture'
import type { Dict } from '@pandacss/types'
import { describe, expect, test } from 'vitest'

function globalCss(values: Dict) {
  const ctx = createGeneratorContext()
  const sheet = ctx.createSheet()
  sheet.processGlobalCss(values)
  return sheet.toCss()
}

describe('Global css', () => {
  test('with direct nesting + conditional value', () => {
    const sheet = globalCss({
      '.btn': {
        width: { base: '40px', lg: '90px' },
        '&:hover': {
          divideX: '40px',
          '& > span': {
            color: 'pink',
          },
        },
        _focus: {
          color: 'red.200',
          _hover: {
            backgroundColor: 'red.400',
          },
        },
        sm: {
          fontSize: '12px',
        },
        '& .aaa': {
          color: 'blue.200',
          '& .bbb': {
            color: 'blue.300',
            '& .ccc': {
              color: 'blue.400',
            },
          },
        },
        '.yyy': {
          color: 'blue.300',
          '.zzz': {
            color: 'green.400',
            '.zzzzzzz': {
              color: 'green.500',
            },
          },
        },
      },
    })

    expect(sheet).toMatchInlineSnapshot(`
      "@layer base {
        .btn {
          width: 40px;
      }

        .btn .aaa {
          color: var(--colors-blue-200);
      }

        .btn .aaa .bbb {
          color: var(--colors-blue-300);
      }

        .btn .aaa .bbb .ccc {
          color: var(--colors-blue-400);
      }

        .btn .yyy {
          color: var(--colors-blue-300);
      }

        .btn .yyy .zzz {
          color: var(--colors-green-400);
      }

        .btn .yyy .zzz .zzzzzzz {
          color: var(--colors-green-500);
      }

        .btn:is(:focus, [data-focus]) {
          color: var(--colors-red-200);
      }

        .btn:is(:focus, [data-focus]):is(:hover, [data-hover]) {
          background-color: var(--colors-red-400);
      }

        .btn:hover > :not([hidden]) ~ :not([hidden]) {
          border-inline-start-width: 40px;
          border-inline-end-width: 0px;
      }

        .btn:hover > span {
          color: pink;
      }

        @media screen and (min-width: 40rem) {
          .btn {
            font-size: 12px;
      }
      }

        @media screen and (min-width: 64rem) {
          .btn {
            width: 90px;
      }
      }
      }"
    `)
  })

  test('classic style object', () => {
    const sheet = globalCss({
      html: {
        scrollPaddingTop: '80px',
        '&.dragging-ew': {
          userSelect: 'none !important',
          '& *': {
            cursor: 'ew-resize !important',
          },
          _hover: {
            color: 'red',
          },
        },
      },
      '.content-dark::-webkit-scrollbar-thumb': {
        backgroundColor: 'var(--colors-bg, #000) !important',
        borderColor: 'var(--colors-fg, #333) !important',
        borderRadius: '9px',
        border: '2px solid',
      },
      '#corner': {
        position: 'fixed',
        right: 0,
        bottom: 0,
        cursor: 'nwse-resize',
      },
      '.color-picker .react-colorful': {
        width: '100%',
      },
    })

    expect(sheet).toMatchInlineSnapshot(`
      "@layer base {
        html {
          scroll-padding-top: 80px;
      }

        html.dragging-ew {
          -webkit-user-select: none !important;
          user-select: none !important;
      }

        html.dragging-ew * {
          cursor: ew-resize !important;
      }

        html.dragging-ew:is(:hover, [data-hover]) {
          color: red;
      }

        .content-dark::-webkit-scrollbar-thumb {
          border: 2px solid;
          border-color: var(--colors-fg, #333) !important;
          border-radius: 9px;
          background-color: var(--colors-bg, #000) !important;
      }

        #corner {
          position: fixed;
          cursor: nwse-resize;
          right: var(--spacing-0);
          bottom: var(--spacing-0);
      }

        .color-picker .react-colorful {
          width: 100%;
      }
      }"
    `)
  })

  test('autoprefixed', () => {
    const sheet = globalCss({
      'x-element': {
        tabSize: 'none',
      },
    })

    expect(sheet).toMatchInlineSnapshot(`
      "@layer base {
        x-element {
          tab-size: none;
      }
      }"
    `)
  })

  test('nesting rules', () => {
    const sheet = globalCss({
      'body > a': {
        '&:not(:hover)': {
          textDecoration: 'none',
        },
      },
    })

    expect(sheet).toMatchInlineSnapshot(`
      "@layer base {
        body > a:not(:hover) {
          text-decoration: none;
      }
      }"
    `)
  })

  test('with recursive nesting rule', () => {
    const sheet = globalCss({
      p: {
        margin: 0,
        '& ~ &': {
          marginTop: 0,
        },
      },
    })

    expect(sheet).toMatchInlineSnapshot(`
      "@layer base {
        p {
          margin: var(--spacing-0);
      }

        p ~ p {
          margin-top: var(--spacing-0);
      }
      }"
    `)
  })

  test('with complex recursive nesting rule + numeric value', () => {
    const sheet = globalCss({
      'body > p, body > ul': {
        margin: 0,
        '& ~ &': {
          marginTop: 10,
        },
      },
    })

    expect(sheet).toMatchInlineSnapshot(`
      "@layer base {
        body > p,body > ul {
          margin: var(--spacing-0);
      }

        :is(body > p) ~ :is(body > p),body > ul ~ body > ul {
          margin-top: var(--spacing-10);
      }
      }"
    `)
  })

  test('with at-rule', () => {
    const sheet = globalCss({
      '@media (min-width: 640px)': {
        'body, :root': {
          color: 'red.200',
        },
      },
    })
    expect(sheet).toMatchInlineSnapshot(`
      "@layer base {
        @media (min-width: 640px) {
          body,:root {
            color: var(--colors-red-200);
      }
      }
      }"
    `)
  })

  test('with nested at-rule', () => {
    const sheet = globalCss({
      '@media (min-width: 640px)': {
        '@supports (display: grid) and (display: contents)': {
          body: {
            color: 'red.200',
            '& a': {
              color: 'red.400',
            },
          },
        },
      },
    })

    expect(sheet).toMatchInlineSnapshot(`
      "@layer base {
        @media (min-width: 640px) {
          @supports (display: grid) and (display: contents) {
            body {
              color: var(--colors-red-200);
      }

            body a {
              color: var(--colors-red-400);
      }
      }
      }
      }"
    `)
  })
})
