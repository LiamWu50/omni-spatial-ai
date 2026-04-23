import Link from 'next/link'

export default function LoginPage() {
  return (
    <main className='flex min-h-screen items-center justify-center bg-[#121212] px-6 text-foreground'>
      <section className='w-full max-w-md rounded-[8px] border border-border bg-card p-8 shadow-dialog'>
        <div className='mb-8'>
          <div className='inline-flex rounded-full border border-border bg-surface-subtle px-3 py-1 text-xs tracking-[1.8px] text-text-secondary font-bold uppercase'>
            Auth Placeholder
          </div>
          <h1 className='mt-4 text-3xl font-bold'>登录模块待接入</h1>
          <p className='mt-3 text-sm leading-6 text-text-secondary font-body'>
            本轮先收敛地图主线与目录结构。登录页已降级为可独立编译的占位页，后续可在此处接回真实认证表单。
          </p>
        </div>

        <div className='space-y-3'>
          <div className='rounded-[6px] border border-border bg-surface-subtle px-4 py-3 text-sm text-text-muted'>
            规划中的能力：账户登录、会话恢复、模型偏好配置。
          </div>
          <Link
            href='/'
            className='inline-flex h-11 w-full items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground transition hover:bg-primary/90 font-display uppercase tracking-[1.4px]'
          >
            返回地图首页
          </Link>
        </div>
      </section>
    </main>
  )
}
