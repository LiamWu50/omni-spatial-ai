export default function LoginPage() {
  return (
    <main className='flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,#111827_0%,#020617_45%,#000000_100%)] px-6 text-white'>
      <section className='earth-panel w-full max-w-md rounded-[32px] p-8'>
        <div className='mb-8'>
          <div className='inline-flex rounded-full border border-white/12 bg-white/8 px-3 py-1 text-xs tracking-[0.18em] text-white/55'>
            AUTH PLACEHOLDER
          </div>
          <h1 className='mt-4 text-3xl font-semibold'>登录模块待接入</h1>
          <p className='mt-3 text-sm leading-6 text-white/58'>
            本轮先收敛地图主线与目录结构。登录页已降级为可独立编译的占位页，后续可在此处接回真实认证表单。
          </p>
        </div>

        <div className='space-y-3'>
          <div className='rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white/80'>
            规划中的能力：账户登录、会话恢复、模型偏好配置。
          </div>
          <a
            href='/'
            className='inline-flex h-11 w-full items-center justify-center rounded-full bg-white text-sm font-medium text-black transition hover:bg-white/90'
          >
            返回地图首页
          </a>
        </div>
      </section>
    </main>
  )
}
