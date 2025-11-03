'use client'
import { useState } from 'react'
import { Dialog, DialogPanel, Disclosure, DisclosureButton, DisclosurePanel, Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react'
import {
  ArrowPathIcon,
  Bars3Icon,
  SquaresPlusIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline'
import { ChevronDownIcon, PlayCircleIcon } from '@heroicons/react/20/solid'
import Image from 'next/image'
import Link from 'next/link'

import Logo from '@/lib/images/logo.png';

const NAV = [
  { href: '/', label: 'Home' },
  { href: '/about', label: 'About' },
  {
    href: '/tools', label: 'Tools',
    children: [
      { name: 'Image to Video', description: 'Convert images to video files', href: '/tools/image-to-video', icon: PlayCircleIcon },
      { name: 'Subtitle Automation', description: 'Automatically generate subtitles for your videos', href: '/tools/subtitle-automation', icon: SquaresPlusIcon },
      { name: 'Background Removal', description: 'Remove backgrounds from images and videos', href: '/tools/background-removal', icon: XMarkIcon },
      { name: 'Audio Editor', description: 'Edit audio files with ease', href: '/tools/audio-editor', icon: ArrowPathIcon },
    ]
  },
];

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <header className="bg-gray-900">
      <nav aria-label="Global" className="mx-auto flex max-w-7xl items-center justify-between p-6 lg:px-8">
        <div className="flex lg:flex-1">
          <Link href="/" className="-m-1.5 p-1.5">
            <span className="sr-only">MediaKit</span>
            <Image alt="MediaKit logo" src={Logo} className="h-8 w-auto" />
          </Link>
        </div>
        <div className="flex lg:hidden">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(true)}
            className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-gray-400"
          >
            <span className="sr-only">Open main menu</span>
            <Bars3Icon aria-hidden="true" className="h-6 w-6" />
          </button>
        </div>

        {/* Desktop nav: replaced Popover with Headless UI Menu per request */}
        <div className="hidden lg:flex lg:gap-x-12">
          {NAV.map((item) =>
            item.children ? (
              <Menu key={item.href} as="div" className="relative">
                <MenuButton className="flex items-center gap-x-1 text-sm/6 font-semibold text-white">
                  {item.label}
                  <ChevronDownIcon aria-hidden="true" className="h-5 w-5 flex-none text-gray-500" />
                </MenuButton>

                <MenuItems
                  anchor="bottom start"
                  className="absolute z-10 mt-4 w-max max-w-md -translate-x-1/2 overflow-hidden rounded-3xl bg-gray-800 outline-1 -outline-offset-1 outline-white/10 transition data-closed:translate-y-1 data-closed:opacity-0 data-enter:duration-200 data-enter:ease-out data-leave:duration-150 data-leave:ease-in"
                >
                  <div className="p-3">
                    {item.children.map((childItem) => (
                      <MenuItem key={childItem.name}>
                        <Link href={childItem.href} className="group flex w-full items-center gap-x-6 rounded-lg p-3 text-sm/6 hover:bg-white/5">
                          <div className="flex h-11 w-11 flex-none items-center justify-center rounded-lg bg-gray-700/50 group-hover:bg-gray-700">
                            <childItem.icon className="size-5 fill-white/30 group-hover:text-white" />
                          </div>
                          <div className="flex-auto block font-semibold text-white">
                            {childItem.name}
                            <p className="mt-1 text-sm font-normal text-gray-400">{childItem.description}</p>
                          </div>
                        </Link>
                      </MenuItem>
                      // <MenuItem key={childItem.name} as="div">
                      //   <div className="group relative flex items-center gap-x-6 rounded-lg p-4 text-sm/6 hover:bg-white/5">
                      //     <div className="flex h-11 w-11 flex-none items-center justify-center rounded-lg bg-gray-700/50 group-hover:bg-gray-700">
                      //       <childItem.icon aria-hidden="true" className="h-6 w-6 text-gray-400 group-hover:text-white" />
                      //     </div>
                      //     <div className="flex-auto">
                      //       <Link href={childItem.href} className="block font-semibold text-white">
                      //         {childItem.name}
                      //         <span className="absolute inset-0" />
                      //       </Link>
                      //       <p className="mt-1 text-gray-400">{childItem.description}</p>
                      //     </div>
                      //   </div>
                      // </MenuItem>
                    ))}
                  </div>
                </MenuItems>
              </Menu>
            ) : (
              <Link key={item.href} href={item.href} className="text-sm/6 font-semibold text-white">
                {item.label}
              </Link>
            )
          )}
        </div>

        <div className="hidden lg:flex lg:flex-1 lg:justify-end items-center gap-3">
          <Link href="/signin" className="text-sm/6 font-semibold text-white">
            Sign in <span aria-hidden="true">&rarr;</span>
          </Link>
        </div>
      </nav>

      <Dialog open={mobileMenuOpen} onClose={setMobileMenuOpen} className="lg:hidden">
        <div className="fixed inset-0 z-50" />
        <DialogPanel className="fixed inset-y-0 right-0 z-50 w-full overflow-y-auto bg-gray-900 p-6 sm:max-w-sm sm:ring-1 sm:ring-gray-100/10">
          <div className="flex items-center justify-between">
            <Link href="/" className="-m-1.5 p-1.5">
              <span className="sr-only">MediaKit</span>
              <Image alt="MediaKit logo" src={Logo} className="h-8 w-auto" />
            </Link>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(false)}
              className="-m-2.5 rounded-md p-2.5 text-gray-400"
            >
              <span className="sr-only">Close menu</span>
              <XMarkIcon aria-hidden="true" className="h-6 w-6" />
            </button>
          </div>

          <div className="mt-6 flow-root">
            <div className="-my-6 divide-y divide-white/10">
              <div className="space-y-2 py-6">
                {
                  /* Mobile nav tools disclosure */
                  NAV.map((item) =>
                    item.children ? (
                      <Disclosure key={item.href} as="div" className="-mx-3">
                        <DisclosureButton className="group flex w-full items-center justify-between rounded-lg py-2 pr-3.5 pl-3 text-base/7 font-semibold text-white hover:bg-white/5">
                          {item.label}
                          <ChevronDownIcon aria-hidden="true" className="h-5 w-5 flex-none group-data-open:rotate-180" />
                        </DisclosureButton>
                        <DisclosurePanel className="mt-2 space-y-2">
                          {item.children.map((childItem) => (
                            <DisclosureButton
                              key={childItem.name}
                              as="a"
                              href={childItem.href}
                              className="block rounded-lg py-2 pr-3 pl-6 text-sm/7 font-semibold text-white hover:bg-white/5"
                            >
                              {childItem.name}
                            </DisclosureButton>
                          ))}
                        </DisclosurePanel>
                      </Disclosure>
                    ) : (
                      <a
                        key={item.href}
                        href={item.href}
                        className="-mx-3 block rounded-lg px-3 py-2 text-base/7 font-semibold text-white hover:bg-white/5"
                      >
                        {item.label}
                      </a>
                    )
                  )
                }
                {/* <Disclosure as="div" className="-mx-3">
                  <DisclosureButton className="group flex w-full items-center justify-between rounded-lg py-2 pr-3.5 pl-3 text-base/7 font-semibold text-white hover:bg-white/5">
                    Tools
                    <ChevronDownIcon aria-hidden="true" className="h-5 w-5 flex-none group-data-open:rotate-180" />
                  </DisclosureButton>
                  <DisclosurePanel className="mt-2 space-y-2">
                    {tools.map((t) => (
                      <DisclosureButton
                        key={t.name}
                        as="a"
                        href={t.href}
                        className="block rounded-lg py-2 pr-3 pl-6 text-sm/7 font-semibold text-white hover:bg-white/5"
                      >
                        {t.name}
                      </DisclosureButton>
                    ))}
                  </DisclosurePanel>
                </Disclosure>

                <a
                  href="#"
                  className="-mx-3 block rounded-lg px-3 py-2 text-base/7 font-semibold text-white hover:bg-white/5"
                >
                  Features
                </a>
                <a
                  href="#"
                  className="-mx-3 block rounded-lg px-3 py-2 text-base/7 font-semibold text-white hover:bg-white/5"
                >
                  Marketplace
                </a>
                <a
                  href="#"
                  className="-mx-3 block rounded-lg px-3 py-2 text-base/7 font-semibold text-white hover:bg-white/5"
                >
                  Company
                </a> */}
              </div>

              <div className="py-6">
                <Link
                  href="/signin"
                  className="-mx-3 block rounded-lg px-3 py-2.5 text-base/7 font-semibold text-white hover:bg-white/5"
                >
                  Sign in
                </Link>
              </div>
            </div>
          </div>
        </DialogPanel>
      </Dialog>
    </header>
  )
}
