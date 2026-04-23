'use client'

import { CircleUserRound, MessageSquareDot, Monitor, Moon, PaintBucket, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'
import { useState } from 'react'

import avatarImage from '@/assets/images/avatar-default.png'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
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

function ThemeDialogContent() {
  const { theme, setTheme } = useTheme()

  return (
    <>
      <DialogHeader>
        <DialogTitle>主题设置</DialogTitle>
        <DialogDescription>选择您喜欢的主题模式</DialogDescription>
      </DialogHeader>
      <div className='grid grid-cols-3 gap-3 py-2'>
        <button
          type='button'
          className={cn(
            'flex cursor-pointer flex-col items-center justify-center rounded-0 border px-2 py-3 transition-all hover:bg-surface-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 font-body',
            theme === 'light' ? 'border-strong bg-surface-subtle text-foreground' : 'border-border text-text-secondary'
          )}
          onClick={() => setTheme('light')}
        >
          <Sun className='mb-2 h-5 w-5' />
          <span className='text-xs font-medium'>浅色模式</span>
        </button>
        <button
          type='button'
          className={cn(
            'flex cursor-pointer flex-col items-center justify-center rounded-0 border px-2 py-3 transition-all hover:bg-surface-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 font-body',
            theme === 'dark' ? 'border-strong bg-surface-subtle text-foreground' : 'border-border text-text-secondary'
          )}
          onClick={() => setTheme('dark')}
        >
          <Moon className='mb-2 h-5 w-5' />
          <span className='text-xs font-medium'>深色模式</span>
        </button>
        <button
          type='button'
          className={cn(
            'flex cursor-pointer flex-col items-center justify-center rounded-0 border px-2 py-3 transition-all hover:bg-surface-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 font-body',
            theme === 'system'
              ? 'border-strong bg-surface-subtle text-foreground'
              : 'border-border text-text-secondary'
          )}
          onClick={() => setTheme('system')}
        >
          <Monitor className='mb-2 h-5 w-5' />
          <span className='text-xs font-medium'>系统模式</span>
        </button>
      </div>
    </>
  )
}

export function UserAvatarTrigger() {
  const [showThemeDialog, setShowThemeDialog] = useState(false)
  const user = defaultUserProfile

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type='button'
            className='flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card'
            aria-label='打开页面设置'
          >
            <Avatar className='h-9 w-9 cursor-pointer rounded-full grayscale'>
              <AvatarImage src={user.avatar.src} alt={user.username} className='object-cover' />
              <AvatarFallback className='rounded-lg'>user</AvatarFallback>
            </Avatar>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          className='w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-[6px]'
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
            <DropdownMenuItem
              onSelect={(e) => {
                e.preventDefault()
                setShowThemeDialog(true)
              }}
            >
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

      <Dialog key='theme-dialog' open={showThemeDialog} onOpenChange={setShowThemeDialog}>
        <DialogContent
          className='z-[60] overflow-hidden border border-border bg-card sm:max-w-[440px]'
          onInteractOutside={(e) => {
            // 阻止点击外部关闭对话框
            e.preventDefault()
          }}
        >
          <ThemeDialogContent />
        </DialogContent>
      </Dialog>
    </>
  )
}
