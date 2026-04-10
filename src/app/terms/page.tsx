export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#f5f5f7] py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-2xl p-8 shadow-[rgba(0,0,0,0.08)_0px_2px_8px]">
          <h1 className="text-3xl font-semibold text-[#1d1d1f] mb-6">使用条例</h1>
          
          <div className="prose prose-sm max-w-none text-[#1d1d1f]">
            <p className="text-[#6e6e73] mb-6">
              最后更新日期：2026年4月5日
            </p>

            <section className="mb-6">
              <h2 className="text-xl font-semibold mb-3">一、总则</h2>
              <p className="text-[#6e6e73] leading-relaxed">
                欢迎使用璧山中学高2027届7班班史系统（以下简称"本系统"）。本系统由北域工作室开发维护，旨在记录班级历史，保存美好回忆。使用本系统前，请仔细阅读以下条款。
              </p>
            </section>

            <section className="mb-6">
              <h2 className="text-xl font-semibold mb-3">二、用户注册</h2>
              <ul className="list-disc list-inside text-[#6e6e73] space-y-2">
                <li>用户需使用真实邮箱进行注册，并完成邮箱验证。</li>
                <li>七班用户需通过身份验证问题确认身份。</li>
                <li>外班用户需填写班级信息，注册后为访客权限。</li>
                <li>所有新注册用户需经管理员审核通过后方可登录使用。</li>
                <li>用户应保管好账号密码，因密码泄露造成的损失由用户自行承担。</li>
              </ul>
            </section>

            <section className="mb-6">
              <h2 className="text-xl font-semibold mb-3">三、用户行为规范</h2>
              <ul className="list-disc list-inside text-[#6e6e73] space-y-2">
                <li>用户发布的内容应真实、健康、积极向上。</li>
                <li>禁止发布违法违规、低俗、暴力、恐怖等不良信息。</li>
                <li>禁止发布侮辱、诽谤、恐吓他人的内容。</li>
                <li>禁止发布广告、垃圾信息或与班级历史无关的内容。</li>
                <li>禁止利用本系统进行任何商业活动。</li>
                <li>尊重他人隐私，未经允许不得发布他人个人信息。</li>
              </ul>
            </section>

            <section className="mb-6">
              <h2 className="text-xl font-semibold mb-3">四、内容管理</h2>
              <ul className="list-disc list-inside text-[#6e6e73] space-y-2">
                <li>用户发布的内容（包括事件记录、评论等）需经过管理员审核。</li>
                <li>管理员有权删除不符合规范的内容，无需事先通知。</li>
                <li>用户发布的内容代表其个人观点，不代表本系统立场。</li>
                <li>本系统对用户发布的内容享有展示、存储、管理的权利。</li>
              </ul>
            </section>

            <section className="mb-6">
              <h2 className="text-xl font-semibold mb-3">五、隐私保护</h2>
              <ul className="list-disc list-inside text-[#6e6e73] space-y-2">
                <li>本系统收集的用户信息仅用于系统运营，不会向第三方泄露。</li>
                <li>用户邮箱仅用于账号验证和重要通知。</li>
                <li>用户头像、昵称等公开信息将展示在系统中。</li>
                <li>用户有权申请删除自己的账号及相关数据。</li>
              </ul>
            </section>

            <section className="mb-6">
              <h2 className="text-xl font-semibold mb-3">六、免责声明</h2>
              <ul className="list-disc list-inside text-[#6e6e73] space-y-2">
                <li>本系统仅提供信息存储服务，不对用户发布的内容负责。</li>
                <li>因网络故障、系统维护等原因导致的服务中断，本系统不承担责任。</li>
                <li>用户因违反本条例造成的任何后果，由用户自行承担。</li>
                <li>本系统保留随时修改本条例的权利，修改后的条例自公布之日起生效。</li>
              </ul>
            </section>

            <section className="mb-6">
              <h2 className="text-xl font-semibold mb-3">七、联系我们</h2>
              <p className="text-[#6e6e73]">
                如有任何问题或建议，请联系管理员或发送邮件至系统管理员邮箱。
              </p>
            </section>

            <div className="mt-8 pt-6 border-t border-[#d2d2d7] text-center">
              <p className="text-[#6e6e73]">
                北域工作室
              </p>
              <p className="text-sm text-[#86868b] mt-2">
                © 2026 璧山中学高2027届7班班史系统 版权所有
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
