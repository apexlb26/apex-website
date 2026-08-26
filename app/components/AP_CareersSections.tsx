import { getCmsContent } from "@/shared/content";
import type { AP_IconName, CareerFormLabels, CareerStat, CareerStep } from "@/shared/types";
import AP_Icon from "@/app/components/AP_Icon";
import AP_TeamVisual from "@/app/components/AP_TeamVisual";
import AP_CareerApplyForm from "@/app/components/AP_CareerApplyForm";

const VALUE_ICONS: AP_IconName[] = ["shield-check", "sparkles", "users", "bulb", "rocket"];
const ROLE_ICONS: AP_IconName[] = ["code", "brain", "cloud", "chart", "trend-up"];

/* Used only when a stored CMS payload predates these fields; every string is editable in the admin. */
const FALLBACK_FORM: CareerFormLabels = {
  nameLabel: "Full Name", namePlaceholder: "e.g., Jane Doe",
  emailLabel: "Email", emailPlaceholder: "jane.doe@email.com",
  phoneLabel: "Phone Number", phonePlaceholder: "+1 (555) 123-4567",
  locationLabel: "Location", locationPlaceholder: "e.g., Toronto, Canada",
  roleLabel: "Role Applying For", rolePlaceholder: "Select a role", roleGeneralOption: "General interest",
  linkedinLabel: "LinkedIn or Portfolio", linkedinPlaceholder: "https://linkedin.com/in/yourprofile",
  resumeLabel: "Resume / CV", resumeDropTitle: "Drag & drop your file here",
  resumeDropBrowse: "or click to browse", resumeReplace: "Choose a different file",
  resumeHint: "PDF, DOC, DOCX (Max 10MB)",
  coverLabel: "Cover Letter", coverPlaceholder: "Tell us why you're a great fit for this role...",
  submit: "Submit application", submitting: "Sending...",
  success: "Application received. We'll get back to you soon.",
  errorResumeMissing: "Please attach your resume or CV.",
  errorResumeType: "Please attach a PDF, DOC, or DOCX file.",
  errorResumeSize: "That file is larger than 10MB.",
  errorGeneric: "Something went wrong. Please try again.",
};

const FALLBACK_STEPS: CareerStep[] = [
  { title: "Application Review", body: "We review your application and get back to you." },
  { title: "Intro Call", body: "A quick call to learn more about you and the role." },
  { title: "Skills & Culture", body: "Technical or practical assessment and team conversation." },
  { title: "Final Interview", body: "Meet with leaders and align on impact and growth." },
  { title: "Offer & Onboard", body: "We extend an offer and prepare you for an amazing start." },
];

/*
 * Layout notes — no media queries anywhere on this page.
 * Every row is a `flex flex-wrap` whose children carry a flex-basis plus
 * `min-w-[min(Npx,100%)]`. The min-width forces a child onto the next line
 * once there is less than N px of room, and the `min(...,100%)` lets that
 * same child shrink below N once it is alone on its line. Fluid padding uses
 * clamp()/max() instead of breakpoints.
 *
 * Each wrapping row ends with zero-height ghost items. They soak up the spare
 * space on a partly filled last line so the real cards keep the exact width of
 * the rows above instead of stretching — flexbox's equivalent of grid's 1fr
 * columns, without a media query.
 */
const ghost = "h-0 min-w-[min(180px,100%)] flex-1 basis-[calc(20%-14px)]";
const shell = "mx-auto w-[min(1640px,86%)]";
const eyebrow = "block text-[10px] font-extrabold uppercase leading-tight tracking-[0.14em] text-cx-cyan2";
const button = "inline-flex h-[34px] items-center justify-center gap-2 rounded px-[18px] text-[10.5px] font-extrabold uppercase tracking-[0.08em] transition-colors [&_svg]:h-[13px] [&_svg]:w-[13px]";
const buttonPrimary = `${button} bg-cx-cyan2 text-white hover:bg-[#00695F]`;
const buttonLight = `${button} bg-white text-cx-cyanInk hover:bg-[#eaf7fb]`;
const textLink = "inline-flex items-center gap-2 text-[10.5px] font-extrabold uppercase tracking-[0.08em] text-cx-cyanInk transition-colors hover:text-[#00897E] [&_svg]:h-[13px] [&_svg]:w-[13px]";
/* Label column beside a content column; the content wraps underneath when cramped. */
const split = "flex flex-wrap gap-x-2.5 gap-y-5";
const splitLabel = "min-w-[min(16rem,100%)] shrink-0 grow-0 basis-64";
const splitBody = "min-w-[min(560px,100%)] flex-1";

export default async function AP_CareersSections({ embedded = false }: { embedded?: boolean }) {
  const { data } = await getCmsContent("en");
  const Wrapper = embedded ? "div" : "main";
  const Title = embedded ? "h2" : "h1";
  const page = data.careers;

  const stats: CareerStat[] = page.heroStats ?? [];
  const steps = page.steps?.length ? page.steps : FALLBACK_STEPS;
  const form = { ...FALLBACK_FORM, ...(page.form ?? {}) };
  const locations = Array.from(new Set([...page.roles.map((role) => role.location), "Remote", "Other"])).filter(Boolean);

  return (
    <>
      <Wrapper className="bg-white text-cx-ink" id="careers">
        {/* ---------- hero: copy and media are two flex children that wrap ---------- */}
        <section className="flex flex-wrap items-stretch border-b border-cx-line bg-white">
          <div className="min-w-[min(560px,100%)] flex-1 basis-[46%] py-9 pl-[max(7%,calc((100vw-1640px)/2))] pr-[7%]">
            <div className="max-w-[700px]">
              <span className={eyebrow}>{page.eyebrow}</span>
              <Title className="mt-3.5 text-[clamp(34px,3.6vw,58px)] font-bold leading-[1.02] tracking-[-0.03em] text-cx-ink">
                {page.title}<br /><span className="text-cx-cyan2">{page.highlight}</span>
              </Title>
              <p className="mt-[18px] max-w-[520px] text-sm leading-[1.75] text-cx-copy">{page.body}</p>
              <div className="mt-[22px] flex flex-wrap items-center gap-x-[26px] gap-y-3">
                <a className={buttonPrimary} href="#open-roles"><span>{page.primaryCta}</span><AP_Icon name="arrow-right" /></a>
                <a className={textLink} href="#life-at-apex"><span>{page.secondaryCta ?? "Life at APEX"}</span><AP_Icon name="arrow-right" /></a>
              </div>
            </div>
          </div>

          <div className="relative min-w-[min(420px,100%)] flex-1 basis-[54%] self-stretch">
            {page.heroImage
              ? <img src={page.heroImage} alt={page.heroImageAlt ?? ""} className="h-full min-h-[240px] w-full object-cover" />
              : <AP_TeamVisual />}
            {/* fades the media into the copy column */}
            <span aria-hidden="true" className="pointer-events-none absolute inset-y-0 left-0 w-[clamp(0px,12vw,260px)] bg-gradient-to-r from-white from-[12%] to-transparent" />
            {stats.length > 0 && (
              <div className="absolute right-[clamp(0.75rem,2vw,1.5rem)] top-[37%] flex w-[min(182px,42%)] flex-col rounded-[10px] bg-white px-4 py-3.5 shadow-[0_14px_36px_rgba(10,26,44,.13)]">
                {stats.map((stat) => (
                  <div key={stat.value} className="flex items-center gap-2.5 py-2.5 [&+div]:border-t [&+div]:border-[#e8eff3]">
                    <AP_Icon name={stat.icon ?? "users"} className="h-5 w-5 shrink-0 text-cx-cyan2" />
                    <div className="min-w-0">
                      <strong className="text-xl font-bold tracking-[-0.02em] text-cx-ink">{stat.value}</strong>
                      <small className="block text-[10px] leading-[1.35] text-cx-muted">{stat.label}</small>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* ---------- values ---------- */}
        <section id="life-at-apex" className="border-b border-cx-line bg-cx-band py-3.5">
          <div className={shell}>
            <div className={`${split} items-center`}>
              <div className={splitLabel}>
                <span className={eyebrow}>{page.valuesEyebrow}</span>
                <h2 className="mt-[7px] text-[19px] font-bold tracking-[-0.02em]">{page.valuesTitle}</h2>
              </div>
              <div className={`${splitBody} flex flex-wrap`}>
                {page.values.map((value, index) => (
                  <article key={value.title} className="flex min-w-[min(190px,100%)] flex-1 basis-[19.9%] items-start gap-3 border-l border-cx-line px-6 py-1.5">
                    <AP_Icon name={value.icon ?? VALUE_ICONS[index % VALUE_ICONS.length]} className="mt-0.5 h-[22px] w-[22px] shrink-0 text-cx-cyan2" />
                    <div className="min-w-0">
                      <h3 className="text-xs font-bold text-cx-cyan2">{value.title}</h3>
                      <p className="mt-[5px] text-[11px] leading-[1.45] text-cx-copy">{value.body}</p>
                    </div>
                  </article>
                ))}
                {Array.from({ length: 4 }).map((_, ghost) => <span key={`ghost-${ghost}`} aria-hidden="true" className="h-0 min-w-[min(190px,100%)] flex-1 basis-[19.9%]" />)}
              </div>
            </div>
          </div>
        </section>

        {/* ---------- open roles ---------- */}
        <section id="open-roles" className="border-b border-cx-line bg-white pb-5 pt-[18px]">
          <div className={shell}>
            <div className={split}>
              <div className={`${splitLabel} flex min-h-[118px] flex-col justify-between gap-3`}>
                <div>
                  <span className={eyebrow}>{page.rolesEyebrow}</span>
                  <h2 className="mt-2 text-[22px] font-bold tracking-[-0.02em]">{page.rolesTitle}</h2>
                </div>
                <a className={textLink} href="#apply"><span>{page.viewAllLabel ?? "View all roles"}</span><AP_Icon name="arrow-right" /></a>
              </div>
              <div className={`${splitBody} flex flex-wrap gap-3.5`}>
                {page.roles.length ? page.roles.map((role, index) => (
                  <article key={role.title} className="flex min-h-[118px] min-w-[min(180px,100%)] flex-1 basis-[calc(20%-14px)] flex-col rounded-lg border border-cx-line bg-white px-[15px] py-[13px] shadow-[0_6px_18px_rgba(10,26,44,.04)] transition hover:-translate-y-0.5 hover:border-[#c3dfea] hover:shadow-[0_12px_26px_rgba(10,26,44,.08)]">
                    <div className="flex items-start justify-between gap-2.5">
                      <strong className="text-[13px] font-bold leading-tight text-cx-ink">{role.title}</strong>
                      <span className="grid h-[26px] w-[26px] shrink-0 place-items-center rounded-md bg-cx-tint text-cx-cyan2">
                        <AP_Icon name={role.icon ?? ROLE_ICONS[index % ROLE_ICONS.length]} className="h-[15px] w-[15px]" />
                      </span>
                    </div>
                    <div className="mt-[9px] flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] text-cx-muted">
                      <span className="inline-flex items-center gap-1.5"><AP_Icon name="pin" className="h-3 w-3" />{role.location}</span>
                      <span className="inline-flex items-center gap-1.5"><AP_Icon name="building" className="h-3 w-3" />{role.type}</span>
                    </div>
                    <p className="mt-[11px] text-[11px] leading-[1.55] text-cx-copy">{role.summary}</p>
                    <a href="#apply" data-apply-role={role.title} className="mt-auto inline-flex items-center gap-1.5 pt-3 text-[10.5px] font-bold text-cx-cyanInk hover:text-[#00897E]">
                      <span>{page.viewRoleLabel ?? "View role"}</span><AP_Icon name="arrow-right" className="h-3 w-3" />
                    </a>
                  </article>
                )) : (
                  <div className="flex min-h-[118px] w-full flex-wrap items-center justify-center gap-4 rounded-lg border border-dashed border-[#bcdde6] bg-cx-tint p-6">
                    <AP_Icon name="briefcase" className="h-7 w-7 shrink-0 text-cx-cyan2" />
                    <div className="min-w-[min(280px,100%)]">
                      <strong className="block text-sm text-cx-ink">{page.emptyTitle}</strong>
                      <p className="mt-[5px] max-w-[520px] text-[11px] leading-[1.55] text-cx-copy">{page.emptyBody}</p>
                    </div>
                  </div>
                )}
                {page.roles.map((role) => <span key={`r-ghost-${role.title}`} aria-hidden="true" className={ghost} />)}
              </div>
            </div>
          </div>
        </section>

        {/* ---------- apply ---------- */}
        <section className="border-b border-cx-line bg-cx-band py-4">
          <div className={shell}>
            <div className={split}>
              <div className={splitLabel}>
                <span className={eyebrow}>{page.applyEyebrow ?? "Apply now"}</span>
                <h2 className="mt-2 text-balance text-[22px] font-bold leading-[1.15] tracking-[-0.02em]">{page.applyTitle ?? "We'd love to hear from you"}</h2>
                {page.applyBody && <p className="mt-3 text-[11.5px] leading-[1.6] text-cx-copy">{page.applyBody}</p>}
              </div>
              <div className={splitBody}>
                <AP_CareerApplyForm
                  roles={page.roles}
                  locations={locations}
                  note={page.applyNote ?? ""}
                  labels={form}
                />
              </div>
            </div>
          </div>
        </section>

        {/* ---------- hiring process ---------- */}
        <section className="border-b border-cx-line bg-cx-band2 py-[18px]">
          <div className={shell}>
            <div className={`${split} items-center`}>
              <div className={splitLabel}>
                <span className={eyebrow}>{page.processEyebrow ?? "Our hiring process"}</span>
                <h2 className="mt-[7px] text-[19px] font-bold tracking-[-0.02em]">{page.processTitle ?? "What to expect"}</h2>
              </div>
              <ol className={`${splitBody} flex flex-wrap`}>
                {steps.map((step, index) => (
                  <li key={step.title} className="flex min-w-[min(185px,100%)] flex-1 basis-[19.9%] items-start gap-3 py-2">
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-[#b9dbe8] bg-white text-[17px] font-bold text-cx-cyan2">{index + 1}</span>
                    <div className="min-w-0 flex-1">
                      <strong className="mt-[3px] block text-xs font-bold text-cx-ink">{step.title}</strong>
                      <p className="mt-[5px] text-[11px] leading-[1.45] text-cx-copy">{step.body}</p>
                    </div>
                    {index < steps.length - 1 && (
                      <i aria-hidden="true" className="mt-[13px] flex shrink-0 items-center gap-1 text-[#8dc0d3]">
                        <span className="block w-5 border-t border-dashed border-[#a9cfdd]" />
                        <AP_Icon name="arrow-right" className="h-[9px] w-[9px]" />
                      </i>
                    )}
                  </li>
                ))}
                {Array.from({ length: 4 }).map((_, ghost) => <li key={`ghost-${ghost}`} aria-hidden="true" className="h-0 min-w-[min(190px,100%)] flex-1 basis-[19.9%]" />)}
              </ol>
            </div>
          </div>
        </section>

        {/* ---------- closing ---------- */}
        <section className="relative overflow-hidden bg-[linear-gradient(90deg,#1087b3_0%,#4ab4da_26%,#51c5e6_52%,#6ad1ef_76%,#8ae2f8_100%)] text-white">
          <span aria-hidden="true" className="ap-cx-dots pointer-events-none absolute inset-y-0 left-[45%] right-0" />
          <div className={`${shell} relative z-[1] flex flex-wrap items-center gap-x-5 gap-y-4 py-[18px]`}>
            <span className="grid h-[54px] w-[54px] shrink-0 place-items-center rounded-[10px] bg-white text-cx-cyanInk">
              <AP_Icon name="users" className="h-7 w-7" />
            </span>
            <div className="min-w-[min(320px,100%)] flex-1">
              <strong className="block text-[19px] font-bold tracking-[-0.01em]">{page.closingTitle ?? "Do meaningful work. With great people."}</strong>
              <p className="mt-[5px] text-[12.5px] text-white/90">{page.closingBody ?? "Let's build the future of intelligent systems—together."}</p>
            </div>
            <a className={`${buttonLight} shrink-0`} href="#open-roles">
              <span>{page.closingCta ?? page.primaryCta}</span><AP_Icon name="arrow-right" />
            </a>
          </div>
        </section>
      </Wrapper>    </>
  );
}
