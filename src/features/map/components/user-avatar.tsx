'use client'

import { CircleUserRound, MessageSquareDot, Monitor, Moon, PaintBucket, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'
import { useState } from 'react'

import avatarImage from '@/assets/images/avatar-default.png'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'

interface UserProfile {
  username: string
  email: string
  avatar: typeof avatarImage
}

const defaultUserProfile: UserProfile = {
  username: '当前用户',
  email: 'user@example.com',
  avatar: avatarImage
}

export function UserAvatarTrigger() {
  const { theme, setTheme } = useTheme()
  const [showThemeDialog, setShowThemeDialog] = useState(false)
  const user = defaultUserProfile

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type='button'
            className='flex h-10 w-10 items-center justify-center rounded-full border border-(--module-panel-border) bg-(--module-panel-bg) shadow-(--module-panel-shadow) backdrop-blur-[20px]'
            aria-label='打开页面设置'
          >
            <Avatar className='h-9 w-9 cursor-pointer rounded-full grayscale'>
              <AvatarImage src={user.avatar.src} alt={user.username} className='object-cover' />
              <AvatarFallback className='rounded-lg'>user</AvatarFallback>
            </Avatar>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          className='w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg'
          side='bottom'
          align='start'
          sideOffset={10}
        >
          <DropdownMenuLabel className='p-0 font-normal'>
            <div className='flex items-center gap-2 px-1 py-1.5 text-left text-sm'>
              <Avatar className='h-8 w-8 rounded-lg'>
                <AvatarImage src={user.avatar.src} alt={user.username} />
                <AvatarFallback className='rounded-lg'>CN</AvatarFallback>
              </Avatar>
              <div className='grid flex-1 text-left text-sm leading-tight'>
                <span className='truncate font-medium'>{user.username}</span>
                <span className='text-muted-foreground truncate text-xs'>{user.email}</span>
              </div>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuGroup className='space-y-1'>
            <DropdownMenuItem>
              <CircleUserRound />
              帐户
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => setShowThemeDialog(true)}>
              <PaintBucket />
              主题设置
            </DropdownMenuItem>
            <DropdownMenuItem>
              <MessageSquareDot />
              通知
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={showThemeDialog} onOpenChange={setShowThemeDialog}>
        <DialogContent className='overflow-hidden rounded-[12px] border-(--module-panel-border) bg-(--module-panel-bg) shadow-(--module-panel-shadow) backdrop-blur-[20px] sm:max-w-[440px]'>
          <DialogHeader>
            <DialogTitle className='text-(--module-panel-text)'>主题设置</DialogTitle>
            <DialogDescription className='text-(--module-panel-text-muted)'>选择您喜欢的主题模式</DialogDescription>
          </DialogHeader>
          <div className='grid grid-cols-3 gap-3 py-2'>
            <button
              type='button'
              className={cn(
                'flex cursor-pointer flex-col items-center justify-center rounded-lg border px-2 py-3 transition-all hover:bg-accent hover:text-accent-foreground',
                theme === 'light' ? 'border-primary/60 bg-primary/5 text-primary' : 'border-muted text-muted-foreground'
              )}
              onClick={() => setTheme('light')}
            >
              <Sun className='mb-2 h-5 w-5' />
              <span className='text-xs font-medium'>浅色模式</span>
            </button>
            <button
              type='button'
              className={cn(
                'flex cursor-pointer flex-col items-center justify-center rounded-lg border px-2 py-3 transition-all hover:bg-accent hover:text-accent-foreground',
                theme === 'dark' ? 'border-primary/60 bg-primary/5 text-primary' : 'border-muted text-muted-foreground'
              )}
              onClick={() => setTheme('dark')}
            >
              <Moon className='mb-2 h-5 w-5' />
              <span className='text-xs font-medium'>深色模式</span>
            </button>
            <button
              type='button'
              className={cn(
                'flex cursor-pointer flex-col items-center justify-center rounded-lg border px-2 py-3 transition-all hover:bg-accent hover:text-accent-foreground',
                theme === 'system'
                  ? 'border-primary/60 bg-primary/5 text-primary'
                  : 'border-muted text-muted-foreground'
              )}
              onClick={() => setTheme('system')}
            >
              <Monitor className='mb-2 h-5 w-5' />
              <span className='text-xs font-medium'>系统模式</span>
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
