#!/usr/bin/env node
// Tiny static-page generator. Wraps page-specific main-content snippets
// in shared <head>/<header>/<footer> markup and writes index.html files
// to the right directories.

const fs = require('fs');
const path = require('path');

const SITE = __dirname;

const HEAD_OPEN = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>__TITLE__ — Shane Built Co</title>
  <meta name="description" content="__DESCRIPTION__" />
  <meta property="og:title" content="__TITLE__ — Shane Built Co" />
  <meta property="og:description" content="__DESCRIPTION__" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Source+Serif+4:ital,wght@0,400;0,500;1,400&display=swap" rel="stylesheet" />
  <link rel="stylesheet" href="/assets/shared.css" />
</head>
<body>
  <div class="mock-banner">
    Mockup preview · Not the live site · <a href="https://www.shanebuiltco.com">Current site</a>
  </div>
  <header class="nav">
    <div class="container nav-inner">
      <a href="/" class="logo">
        <span class="logo-mark">SB</span>
        <span>SHANE&nbsp;BUILT</span>
      </a>
      <nav>
        <ul>
          <li><a href="/work/">Work</a></li>
          <li><a href="/services/">Services</a></li>
          <li><a href="/process/">Process</a></li>
          <li><a href="/about/">About</a></li>
          <li><a href="/resources/">Resources</a></li>
          <li><a href="/contact/">Contact</a></li>
        </ul>
      </nav>
      <div class="nav-cta">
        <a href="tel:18038845751" class="btn btn-secondary">803.884.5751</a>
        <a href="/contact/" class="btn btn-primary">Start a Project Review</a>
      </div>
    </div>
  </header>
  <main>`;

const FOOT = `  </main>
  <footer>
    <div class="container">
      <p class="foot-tag">Built for healthier homes, better businesses, and buildings that hold up — long after we hand you the keys.</p>
      <a href="/contact/" class="btn btn-ghost arrow" style="margin-bottom: 2rem;">Start a Project Review</a>
      <div class="foot-grid">
        <div>
          <a href="/" class="logo" style="margin-bottom: 0.875rem;">
            <span class="logo-mark" style="border-color: var(--brass); color: var(--bg-warm); background: transparent;">SB</span>
            <span style="color: var(--bg-warm);">SHANE&nbsp;BUILT</span>
          </a>
          <p class="foot-meta">1805 Clemson Rd, Suite 291041<br/>Columbia, SC 29229</p>
          <p class="foot-meta">803.884.5751<br/>contact@shanebuiltco.com</p>
        </div>
        <div>
          <h4>Services</h4>
          <ul>
            <li><a href="/services/residential-remodels/">Residential Remodels</a></li>
            <li><a href="/services/custom-homes/">Custom Homes</a></li>
            <li><a href="/services/commercial-remodels-upfits/">Commercial Remodels &amp; Upfits</a></li>
            <li><a href="/services/commercial-new-construction/">Commercial New Construction</a></li>
            <li><a href="/services/custom-cabinetry-casework/">Custom Cabinetry</a></li>
          </ul>
        </div>
        <div>
          <h4>For</h4>
          <ul>
            <li><a href="/contact/">Homeowners</a></li>
            <li><a href="/contact/">Commercial owners</a></li>
            <li><a href="/contact/">Design partners</a></li>
            <li><a href="/contact/">Subcontractors</a></li>
            <li><a href="/contact/">Careers</a></li>
          </ul>
        </div>
        <div>
          <h4>Connect</h4>
          <ul>
            <li><a href="https://www.instagram.com/" rel="nofollow">Instagram</a></li>
            <li><a href="https://www.linkedin.com/" rel="nofollow">LinkedIn</a></li>
            <li><a href="https://www.houzz.com/professionals/general-contractors/shane-built-pfvwus-pf~1707090121" rel="nofollow">Houzz · 5/5 ★</a></li>
            <li><a href="https://www.facebook.com/p/Shane-Built-61562393821137/" rel="nofollow">Facebook</a></li>
          </ul>
        </div>
      </div>
      <div class="foot-bot">
        <span>© 2026 Shane Built Co · Licensed &amp; Insured · Columbia, SC</span>
        <span><a href="#">Privacy</a> · <a href="#">Terms</a></span>
      </div>
    </div>
  </footer>
  <script src="/assets/shared.js" defer></script>
</body>
</html>`;

function pageHero(opts) {
  return `<section class="page-hero">
      <div class="container">
        <p class="breadcrumb"><a href="/">Home</a> · ${opts.crumb}</p>
        <p class="eyebrow" style="color: var(--brass-soft);">${opts.eyebrow || ''}</p>
        <h1>${opts.h1}</h1>
        ${opts.lede ? `<p class="lede">${opts.lede}</p>` : ''}
      </div>
    </section>`;
}

function stub(opts) {
  return `<section class="stub">
      <div class="container">
        <span class="badge">Page in development</span>
        <h1>${opts.title}</h1>
        <p>${opts.body}</p>
        <div class="stub-actions">
          <a href="/contact/" class="btn btn-primary arrow">Start a Project Review</a>
          <a href="/" class="btn btn-secondary arrow">Back to Home</a>
        </div>
      </div>
    </section>`;
}

function ctaBlock() {
  return `<section style="background: var(--bg-deep); color: var(--bg-warm); padding: 4rem 0; text-align: center;">
      <div class="container">
        <h2 style="color: var(--bg-warm); max-width: 24ch; margin-inline: auto;">Have a similar project in mind?</h2>
        <p style="color: rgba(247,243,236,0.85); max-width: 52ch; margin-inline: auto; font-size: 1.0625rem;">Tell us about it. The first 30 minutes is a no-charge fit conversation.</p>
        <a href="/contact/" class="btn btn-ghost arrow" style="margin-top: 1rem;">Start a Project Review</a>
      </div>
    </section>`;
}

function writePage(relPath, title, description, body) {
  const head = HEAD_OPEN
    .replace(/__TITLE__/g, title)
    .replace(/__DESCRIPTION__/g, description);
  const html = head + '\n' + body + '\n' + FOOT;
  const dir = path.join(SITE, relPath);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'index.html'), html);
  console.log('wrote', relPath + '/index.html');
}

// ============== Work index ==============
writePage('work', 'Work', 'Recent residential remodels, custom homes, commercial remodels and upfits, and custom casework projects across the Midlands.', `
${pageHero({ crumb: 'Work', eyebrow: 'Projects', h1: 'Work across all five service lines.', lede: 'Recent projects from Shane Built Co. Filter by service line, space, or year. New case studies are added as projects close out.' })}
<section>
  <div class="container">
    <div class="work-grid">
      <article class="work-card"><a class="card-link" href="/work/salon-suites/"><div class="work-thumb t-salon"><span class="tag">Commercial Upfit</span></div><div class="work-meta"><span><strong>2024</strong></span><span>·</span><span>Forest Acres, SC</span></div><h3>Salon Suites</h3><p class="work-scope">Complete tenant build-out · 4,000 sf · custom casework · w/ DIG Architects + GMK Design</p></a></article>
      <article class="work-card"><a class="card-link" href="/work/f-ave-renovation/"><div class="work-thumb t-fave"><span class="tag">Residential Remodel</span></div><div class="work-meta"><span><strong>2023</strong></span><span>·</span><span>Cayce, SC</span></div><h3>F Ave Renovation</h3><p class="work-scope">Private residence · extensive full-house remodel · w/ Phase One Design</p></a></article>
      <article class="work-card"><a class="card-link" href="/work/retail-build-out/"><div class="work-thumb t-retail"><span class="tag">Commercial Remodel</span></div><div class="work-meta"><span><strong>2022</strong></span><span>·</span><span>Columbia, SC</span></div><h3>Retail Build Out</h3><p class="work-scope">Sales floor remodel · custom casework · w/ Glen W. Anderson</p></a></article>
      <article class="work-card"><a class="card-link" href="/work/harbison-senior-living/"><div class="work-thumb t-harbison"><span class="tag">Commercial Remodel</span></div><div class="work-meta"><span><strong>2020</strong></span><span>·</span><span>Irmo, SC</span></div><h3>Harbison Senior Living</h3><p class="work-scope">Shower/bath facility · laundry · custom cabinetry · w/ GMK Associates</p></a></article>
      <article class="work-card coming"><a class="card-link" href="/services/custom-homes/"><div class="work-thumb t-customhome"><span class="tag">Custom Home</span></div><div class="work-meta"><span><strong>Service line</strong></span><span>·</span><span>Midlands, SC</span></div><h3>Custom Homes</h3><p class="work-scope">Ground-up residential builds — featured project case study coming soon.</p></a></article>
      <article class="work-card coming"><a class="card-link" href="/services/commercial-new-construction/"><div class="work-thumb t-commercial"><span class="tag">Commercial New Build</span></div><div class="work-meta"><span><strong>Service line</strong></span><span>·</span><span>Midlands, SC</span></div><h3>Commercial New Construction</h3><p class="work-scope">Selective ground-up commercial — featured project case study coming soon.</p></a></article>
    </div>
  </div>
</section>
${ctaBlock()}
`);

// ============== F Ave case study (full) ==============
writePage('work/f-ave-renovation', 'F Ave Renovation', 'Whole-house remodel in Cayce, SC. Private residence, 2023, in collaboration with Phase One Design.', `
<section class="page-hero" style="padding-bottom: 6rem;">
  <div class="container">
    <p class="breadcrumb"><a href="/">Home</a> · <a href="/work/">Work</a> · F Ave Renovation</p>
    <p class="eyebrow" style="color: var(--brass-soft);">Residential Remodel · 2023</p>
    <h1>F Ave Renovation</h1>
    <p class="lede" style="color: rgba(247,243,236,0.85);">Whole-house remodel in Cayce, SC — kitchen, bath, finish carpentry, and a thorough re-think of how the space actually gets used day-to-day.</p>
  </div>
</section>
<div class="container">
  <div class="case-snapshot">
    <div class="item"><label>Service Line</label><span>Residential Remodel</span></div>
    <div class="item"><label>Location</label><span>Cayce, SC</span></div>
    <div class="item"><label>Year</label><span>2023</span></div>
    <div class="item"><label>Owner</label><span>Private Residence</span></div>
    <div class="item"><label>Design Partner</label><span>Phase One Design</span></div>
    <div class="item"><label>Scope</label><span>Whole-house remodel</span></div>
    <div class="item"><label>Occupied during work</label><span>No</span></div>
    <div class="item"><label>Self-perform</label><span>GC + finish carpentry</span></div>
  </div>
</div>

<div class="case-section">
  <p class="eyebrow">Owner goal</p>
  <h2>Make the house work the way the owner actually lives.</h2>
  <p>The owner wanted more than a finish refresh — the layout, storage, and circulation needed to change. Our brief was to plan the work around how the family actually moves through the house, then bring the finish quality to match.</p>
</div>

<div class="container case-photos featured">
  <img src="/assets/fave-35b0d825.jpg" alt="Master bath after remodel — marble floor, navy walls, lit-edge mirror" />
  <img src="/assets/fave-49fc0ddb.jpg" alt="F Ave renovation detail" />
  <img src="/assets/fave-33aea9c1.jpg" alt="F Ave renovation detail" />
</div>

<div class="case-section">
  <p class="eyebrow">Build strategy</p>
  <h2>Plan the unseen work first.</h2>
  <p>Before any finishes were specified, we walked the envelope. The bath remodel meant new plumbing rough-in — which meant we could correct decades of moisture detail at the same time. We rebuilt the wet-area assemblies with proper waterproofing, set the marble shower to a real slope, and made sure the vanity wall would handle the new lighting load before we closed it back up.</p>
  <p>The kitchen scope let us re-route layout pinch points and bring storage into spaces that had previously been wasted. Custom finish carpentry tied the whole house together — same shaker profile, same brushed-nickel pulls, same breathing room around the doors and trim.</p>
</div>

<div class="container case-photos">
  <img src="/assets/fave-a8d62265.jpg" alt="F Ave renovation detail" />
  <img src="/assets/fave-6ce9224a.jpg" alt="F Ave renovation detail" />
  <img src="/assets/fave-ba05eaee.jpg" alt="F Ave renovation detail" />
  <img src="/assets/fave-6bd1fb09.jpg" alt="F Ave renovation detail" />
  <img src="/assets/fave-ec2aa33a.jpg" alt="F Ave renovation detail" />
  <img src="/assets/fave-78575d72.jpg" alt="F Ave renovation detail" />
</div>

<div class="case-section">
  <p class="eyebrow">Field constraints</p>
  <h2>What we ran into and how we handled it.</h2>
  <p>Concealed conditions in older houses are the rule, not the exception. We hit framing irregularities behind the bath wall and unexpected substrate work in the kitchen flooring transition. The schedule was built with a real allowance for discovery, so neither of those issues turned into a budget conversation.</p>
</div>

<div class="case-section">
  <p class="eyebrow">Finished result</p>
  <h2>A house that performs the way it looks.</h2>
  <p>Polished marble. Navy bath walls with lit-edge mirror. Soft-close inset cabinetry and a shower that drains the way it should. The owner has been in the house for over a year now — no callbacks, no maintenance issues, no second-guessing the plan.</p>
</div>

${ctaBlock()}
`);

// ============== Stub case studies ==============
function caseStub(slug, title, year, location, kind, scope, partner) {
  return writePage('work/' + slug, title, `${title} — ${kind} in ${location}, ${year}.`, `
${pageHero({ crumb: `<a href="/work/">Work</a> · ${title}`, eyebrow: `${kind} · ${year}`, h1: title, lede: `${scope}${partner ? ' — w/ ' + partner : ''}.` })}
<section class="stub">
  <div class="container">
    <span class="badge">Full case study coming soon</span>
    <h1>Case study in development</h1>
    <p>This project is in the queue for a full case-study writeup with photo sequence, owner goals, build strategy, and field constraints. In the meantime, the home page and Work index show the project metadata and representative photo.</p>
    <div class="stub-actions">
      <a href="/contact/" class="btn btn-primary arrow">Start a Project Review</a>
      <a href="/work/" class="btn btn-secondary arrow">Back to Work</a>
    </div>
  </div>
</section>
`);
}

caseStub('salon-suites', 'Salon Suites', '2024', 'Forest Acres, SC', 'Commercial Upfit', 'Complete tenant build-out · 4,000 sf · custom casework', 'DIG Architects + GMK Design');
caseStub('retail-build-out', 'Retail Build Out', '2022', 'Columbia, SC', 'Commercial Remodel', 'Sales floor remodel · custom casework', 'Glen W. Anderson');
caseStub('harbison-senior-living', 'Harbison Senior Living', '2020', 'Irmo, SC', 'Commercial Remodel', 'Shower/bath facility · laundry · custom cabinetry', 'GMK Associates');

// ============== Services overview ==============
writePage('services', 'Services', 'Five service lines — residential remodels, custom homes, commercial remodels and upfits, commercial new construction, and custom cabinetry — plus preconstruction planning.', `
${pageHero({ crumb: 'Services', eyebrow: 'What we build', h1: 'Five service lines, one operating philosophy.', lede: 'We plan for what\'s underneath the finish before we start tearing anything open or breaking ground. Whether we\'re framing a custom home or upfitting an existing tenant space, the same standards apply.' })}
<section>
  <div class="container">
    <div class="fit-grid">
      <a class="fit-card" href="/services/residential-remodels/"><span class="badge">01 · Residential</span><h3>Remodels &amp; renovations</h3><p>Kitchens, baths, additions, and full-house renovations.</p><span class="for">For owners planning a remodel they won't redo in seven years.</span><span class="more arrow">Learn more</span></a>
      <a class="fit-card" href="/services/custom-homes/"><span class="badge">02 · Residential</span><h3>Custom homes</h3><p>Ground-up custom homes designed around envelope, IAQ, and durability.</p><span class="for">For owners building once, building it right.</span><span class="more arrow">Learn more</span></a>
      <a class="fit-card" href="/services/commercial-remodels-upfits/"><span class="badge">03 · Commercial</span><h3>Remodels &amp; tenant upfits</h3><p>Retail, office, restaurant, salon, and small medical/wellness build-outs.</p><span class="for">For owners who need code, sequencing, and continuity handled cleanly.</span><span class="more arrow">Learn more</span></a>
      <a class="fit-card" href="/services/commercial-new-construction/"><span class="badge">04 · Commercial</span><h3>New construction</h3><p>Selective ground-up commercial — small-to-mid retail, office, light industrial.</p><span class="for">For owners who want a thinking builder, not just a low bid.</span><span class="more arrow">Learn more</span></a>
      <a class="fit-card" href="/services/custom-cabinetry-casework/"><span class="badge">05 · Cabinetry</span><h3>Custom cabinetry &amp; casework</h3><p>Built-ins, kitchens, retail fixtures, and casework.</p><span class="for">For projects where the millwork is the project.</span><span class="more arrow">Learn more</span></a>
    </div>
    <p class="fit-disclaimer" style="margin-top: 2rem;">Don't see your project type? We also take selective preconstruction-only and project-planning engagements. <a href="/services/preconstruction/" style="font-weight:600;">Learn about preconstruction →</a></p>
  </div>
</section>
${ctaBlock()}
`);

// ============== Commercial New Construction (full service page) ==============
writePage('services/commercial-new-construction', 'Commercial New Construction', 'Ground-up commercial construction in Columbia, SC — small-to-mid retail, office, light industrial, and specialty buildings delivered with preconstruction discipline.', `
${pageHero({ crumb: '<a href="/services/">Services</a> · Commercial New Construction', eyebrow: '04 · Commercial', h1: 'Ground-up commercial, built to perform from day one.', lede: 'Selective new commercial construction across the Midlands — for owners who want envelope, IAQ, durability, and operational practicality designed in from the start, not value-engineered out at the end.' })}

<section class="service-section">
  <div class="container">
    <p class="eyebrow">What we do</p>
    <h2>What ground-up commercial work looks like with Shane Built Co.</h2>
    <p>We deliver commercial new construction projects in the small-to-mid range — typically retail, office, light industrial, restaurant, salon/wellness, and specialty buildings where the owner is involved enough to care about how the building performs over its lifetime, not just how it shows on opening day.</p>
    <p>The work begins long before the slab is poured. We bring our preconstruction discipline to the early decisions — site selection, code path, delivery method, envelope strategy, mechanical sequencing — so the project is set up to run cleanly through framing, MEP, dry-in, and closeout.</p>
  </div>
</section>

<section class="service-section">
  <div class="container">
    <p class="eyebrow">Who it's for</p>
    <h2>Commercial owners who want to be in the building for the next twenty years.</h2>
    <p>If you're building a property to sell on day-365, we're not the right builder. If you're building because the business runs out of this space — and the building working the way it should is part of how the business runs — we are. We work with single-asset owners, owner-operators, and small portfolio holders who care about durability, maintenance cost, and tenant experience as much as initial price.</p>
    <p><strong>Not for:</strong> ground-up institutional mega-projects, large public works, design-bid-build commodity construction. We're not McCrory or MB Kahn — and you shouldn't hire us to be.</p>
  </div>
</section>

<section class="service-section">
  <div class="container">
    <p class="eyebrow">How we approach it</p>
    <h2>Five steps from pro forma to closeout.</h2>
    <div class="service-steps">
      <div class="service-step"><span class="step-num">Step 01</span><h3>Project Review &amp; Feasibility</h3><p>A 30-min conversation about the project, the site, the budget reality, and the schedule. We help you size the project against your pro forma before we both spend more time on it. No charge.</p></div>
      <div class="service-step"><span class="step-num">Step 02</span><h3>Preconstruction</h3><p>Site analysis, envelope strategy, code path, delivery-method selection (Design-Build, CM at Risk, or DBB), constructability review, and a budget you can hold up against your lender's expectations. Building science decisions get made here — before they cost ten times more to fix later.</p></div>
      <div class="service-step"><span class="step-num">Step 03</span><h3>Permitting &amp; Mobilization</h3><p>We coordinate the permit set with your design team, walk the project through Richland or Lexington county review, and prep the site for mobilization. You get a clear pre-construction milestone schedule so you know what's owed and when.</p></div>
      <div class="service-step"><span class="step-num">Step 04</span><h3>Build</h3><p>Weekly photo updates, owner walks at key milestones (foundation, dry-in, MEP rough-in, drywall, finish), strict subcontractor standards, daily site cleanup, and one point of contact for the entire build phase. Field standards are non-negotiable.</p></div>
      <div class="service-step"><span class="step-num">Step 05</span><h3>Closeout &amp; Warranty</h3><p>Punch, occupancy permit, as-built documentation, warranty packet, and a 60-day post-occupancy walk to catch anything the building tells us about itself once it's running. We stand behind the work.</p></div>
    </div>
  </div>
</section>

<section class="service-section" style="background: var(--bg-deep); color: var(--bg-warm); border-top: 4px solid var(--brass);">
  <div class="container">
    <p class="eyebrow" style="color: var(--brass-soft);">The building science angle</p>
    <h2 style="color: var(--bg-warm);">New construction is where building science earns the most.</h2>
    <p style="color: rgba(247,243,236,0.85);">In a remodel we work around what's already there. In new construction we get to plan the envelope, drainage, ventilation, and durability systems from a blank slate — and that's where they pay off the most. We design the air barrier continuity before framing closes, target a real blower-door number, plan for balanced mechanical ventilation, spec assemblies that match each other on moisture and thermal behavior, and pick finishes you can actually maintain. The owner sees lower operating cost, fewer callbacks, and a building that holds its value over a 20-year hold.</p>
  </div>
</section>

<section class="service-section">
  <div class="container">
    <p class="eyebrow">Common questions</p>
    <h2>Frequently asked.</h2>
    <div class="service-steps">
      <div class="service-step"><span class="step-num">Q</span><h3>What size projects do you take?</h3><p>Small-to-mid commercial — typically $750K to $5M total project cost. Below that range, the preconstruction discipline isn't worth the overhead. Above it, we're not the right shop. We'll be honest in the first call about whether you're in our lane.</p></div>
      <div class="service-step"><span class="step-num">Q</span><h3>What delivery methods do you support?</h3><p>Design-Build (we recommend this most often), CM at Risk, and Design-Bid-Build. We don't do hard-bid commodity work — the building science we care about doesn't survive a low-bid race.</p></div>
      <div class="service-step"><span class="step-num">Q</span><h3>Are you bonded?</h3><p>Bonding is available on qualified projects. Specific bonding capacity, surety, and program are discussed during preconstruction once project scope is defined.</p></div>
      <div class="service-step"><span class="step-num">Q</span><h3>Where do you work?</h3><p>Columbia and the broader Midlands — Richland, Lexington, Kershaw, Fairfield, and Newberry counties. We'll consider projects further out if the project warrants it, but our service area is intentionally tight.</p></div>
    </div>
  </div>
</section>

${ctaBlock()}
`);

// ============== Service-page stubs ==============
function serviceStub(slug, title, badge, summary) {
  return writePage('services/' + slug, title, summary, `
${pageHero({ crumb: `<a href="/services/">Services</a> · ${title}`, eyebrow: badge, h1: title, lede: summary })}
${stub({ title: 'Service page in development', body: 'The full content for this service page — what we do, who it\'s for, how we approach it, building-science angle, and FAQs — is on the build list. Reach out and we\'ll talk through your specific project directly.' })}
`);
}

serviceStub('residential-remodels', 'Residential Remodels &amp; Renovations', '01 · Residential', 'Kitchens, baths, additions, and full-house remodels — for owners planning a remodel they won\'t redo in seven years.');
serviceStub('custom-homes', 'Custom Homes &amp; Residential New Construction', '02 · Residential', 'Ground-up custom homes designed around envelope, IAQ, and durability decisions made before framing closes.');
serviceStub('commercial-remodels-upfits', 'Commercial Remodels &amp; Tenant Upfits', '03 · Commercial', 'Retail, office, restaurant, salon, and small medical/wellness build-outs delivered on schedule with low disruption.');
serviceStub('custom-cabinetry-casework', 'Custom Cabinetry &amp; Casework', '05 · Cabinetry', 'Built-ins, kitchens, retail fixtures, and casework designed for daily use.');
serviceStub('preconstruction', 'Preconstruction &amp; Project Planning', '06 · Planning', 'Site analysis, envelope strategy, code path, delivery-method selection, and budget development before construction starts.');

// ============== Process ==============
writePage('process', 'Process', 'Five clear steps from first call to closeout — Project Review, Preconstruction, Scope/Budget/Schedule, Build, and Closeout.', `
${pageHero({ crumb: 'Process', eyebrow: 'How we build', h1: 'Five clear steps from first call to closeout.', lede: 'Same process for a kitchen remodel and a 10,000-sf commercial new build. The size scales; the discipline doesn\'t.' })}
<section>
  <div class="container">
    <div class="process-row" style="margin-top: 0;">
      <div class="step"><h4>Project Review</h4><p class="deliverable">A 30-min call to understand the project, the goal, and the fit. No charge.</p></div>
      <div class="step"><h4>Site Walk &amp; Preconstruction</h4><p class="deliverable">Field notes, feasibility flags, code path, and next-step recommendations.</p></div>
      <div class="step"><h4>Scope, Budget &amp; Schedule</h4><p class="deliverable">A scope you can read, a budget that holds up, and a schedule that makes sense.</p></div>
      <div class="step"><h4>Build</h4><p class="deliverable">Weekly photo updates, daily site cleanup, and one point of contact through the whole job.</p></div>
      <div class="step"><h4>Closeout &amp; Warranty</h4><p class="deliverable">Punch, walk-through, warranty packet, as-built documentation.</p></div>
    </div>
  </div>
</section>
${ctaBlock()}
`);

// ============== About ==============
writePage('about', 'About', 'Founded in 2015 by Shane Miller. A small, founder-led general contractor in Columbia, SC focused on residential and commercial work where the building performs as well as it shows.', `
${pageHero({ crumb: 'About', eyebrow: 'Founder-led, since 2015', h1: 'Built by Shane Miller.', lede: 'Shane Built Co is a small, founder-led general contractor in Columbia, SC focused on residential and commercial projects where the building has to perform as well as it shows.' })}
<section>
  <div class="container">
    <div class="founder-grid">
      <div class="founder-photo" aria-hidden="true"></div>
      <div class="founder-content">
        <p class="eyebrow">Founder</p>
        <h2>Shane Miller, Founding Principal.</h2>
        <p>Shane is a South Carolina native who spent his early career in marketing and sales before moving full-time into construction. He founded Shane Built Co in 2015 to build the kind of work he kept seeing missing in the Midlands — projects where the planning behind the finish was as carefully thought-through as the finish itself.</p>
        <p>He's still on every project. Site walks, scope decisions, framing reviews on custom homes, and the punch list at the end — that's him, not a sales rep handing off to a foreman.</p>
        <blockquote class="founder-quote">"A good build is not just the finish you see. It's the planning, sequencing, and hidden details that keep the building working — long after we hand you the keys."</blockquote>
        <p class="founder-byline">Shane Miller · Founding Principal · Licensed GC</p>
      </div>
    </div>
  </div>
</section>
<section style="padding: var(--space-7) 0; background: var(--bg-deep); color: var(--bg-warm); border-top: 4px solid var(--brass);">
  <div class="container">
    <p class="eyebrow" style="color: var(--brass-soft);">Field Standards</p>
    <h2 style="color: var(--bg-warm); max-width: 24ch;">How we run a jobsite.</h2>
    <p style="color: rgba(247,243,236,0.85); max-width: 60ch;">Daily site cleanup. Dust containment for occupied-space remodels. Background-checked subs. One point of contact through every project. Weekly photo updates. Closeout documentation that means something. The standards don't change between a $50K bath and a $3M ground-up office.</p>
  </div>
</section>
${ctaBlock()}
`);

// ============== Resources ==============
writePage('resources', 'Resources', 'Owner-facing guides for Columbia, SC remodels, custom homes, and commercial builds.', `
${pageHero({ crumb: 'Resources', eyebrow: 'Owner education', h1: 'Practical guides for Columbia owners.', lede: 'No fluff, no listicles. Real content for owners thinking through a remodel, custom home, or commercial build in the Midlands.' })}
<section>
  <div class="container">
    <div class="res-grid">
      <article class="res-card"><div class="res-thumb"></div><span class="topic">Remodel</span><h3>How a building-science approach saves you money on a Columbia remodel</h3><p>Article in development.</p></article>
      <article class="res-card"><div class="res-thumb"></div><span class="topic">Custom Home</span><h3>What to ask before hiring a custom home builder in Columbia, SC</h3><p>Article in development.</p></article>
      <article class="res-card"><div class="res-thumb"></div><span class="topic">Commercial Upfit</span><h3>What to ask before signing a Columbia commercial upfit contract</h3><p>Article in development.</p></article>
      <article class="res-card"><div class="res-thumb"></div><span class="topic">Commercial New Build</span><h3>Commercial new construction in the Midlands: preconstruction questions</h3><p>Article in development.</p></article>
      <article class="res-card"><div class="res-thumb"></div><span class="topic">Permitting</span><h3>Permitting in Columbia, SC: a homeowner's primer</h3><p>Article in development.</p></article>
    </div>
  </div>
</section>
${ctaBlock()}
`);

// ============== Contact ==============
writePage('contact', 'Contact', 'Start a Project Review with Shane Built Co. We respond within 15 minutes during business hours.', `
${pageHero({ crumb: 'Contact', eyebrow: 'Talk to us', h1: 'Start a Project Review.', lede: 'Tell us about your project. The first 30 minutes is a no-charge fit conversation. We respond within 15 minutes during business hours, next business morning otherwise.' })}
<section>
  <div class="container" style="display: grid; grid-template-columns: 1.5fr 1fr; gap: 3rem; max-width: 1080px;">
    <div>
      <p class="eyebrow">Project inquiry</p>
      <h2>Tell us about it.</h2>
      <p>The fields below let us route your inquiry quickly and prepare for the call. Anything optional you can skip.</p>
      <form style="display: grid; gap: 1rem; margin-top: 1.5rem;">
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
          <label style="display: grid; gap: 0.25rem;"><span style="font-size: 0.75rem; letter-spacing: 0.1em; text-transform: uppercase; color: var(--concrete);">First name *</span><input type="text" required style="padding: 0.625rem 0.875rem; border: 1px solid var(--rule); border-radius: 2px; font-family: inherit; font-size: 0.9375rem;" /></label>
          <label style="display: grid; gap: 0.25rem;"><span style="font-size: 0.75rem; letter-spacing: 0.1em; text-transform: uppercase; color: var(--concrete);">Last name *</span><input type="text" required style="padding: 0.625rem 0.875rem; border: 1px solid var(--rule); border-radius: 2px; font-family: inherit; font-size: 0.9375rem;" /></label>
        </div>
        <label style="display: grid; gap: 0.25rem;"><span style="font-size: 0.75rem; letter-spacing: 0.1em; text-transform: uppercase; color: var(--concrete);">Email *</span><input type="email" required style="padding: 0.625rem 0.875rem; border: 1px solid var(--rule); border-radius: 2px; font-family: inherit; font-size: 0.9375rem;" /></label>
        <label style="display: grid; gap: 0.25rem;"><span style="font-size: 0.75rem; letter-spacing: 0.1em; text-transform: uppercase; color: var(--concrete);">Phone *</span><input type="tel" required style="padding: 0.625rem 0.875rem; border: 1px solid var(--rule); border-radius: 2px; font-family: inherit; font-size: 0.9375rem;" /></label>
        <label style="display: grid; gap: 0.25rem;"><span style="font-size: 0.75rem; letter-spacing: 0.1em; text-transform: uppercase; color: var(--concrete);">Project type *</span><select required style="padding: 0.625rem 0.875rem; border: 1px solid var(--rule); border-radius: 2px; font-family: inherit; font-size: 0.9375rem; background: #fff;"><option value="">Choose one</option><option>Residential remodel</option><option>Residential new construction / custom home</option><option>Commercial remodel</option><option>Tenant upfit</option><option>Commercial new construction (ground-up)</option><option>Custom cabinetry / casework</option><option>Preconstruction / project planning only</option><option>Other</option></select></label>
        <label style="display: grid; gap: 0.25rem;"><span style="font-size: 0.75rem; letter-spacing: 0.1em; text-transform: uppercase; color: var(--concrete);">Project address or city *</span><input type="text" required style="padding: 0.625rem 0.875rem; border: 1px solid var(--rule); border-radius: 2px; font-family: inherit; font-size: 0.9375rem;" /></label>
        <label style="display: grid; gap: 0.25rem;"><span style="font-size: 0.75rem; letter-spacing: 0.1em; text-transform: uppercase; color: var(--concrete);">Scope summary</span><textarea rows="4" style="padding: 0.625rem 0.875rem; border: 1px solid var(--rule); border-radius: 2px; font-family: inherit; font-size: 0.9375rem;" placeholder="What do you want this project to do? What's working? What isn't?"></textarea></label>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
          <label style="display: grid; gap: 0.25rem;"><span style="font-size: 0.75rem; letter-spacing: 0.1em; text-transform: uppercase; color: var(--concrete);">Desired start window</span><select style="padding: 0.625rem 0.875rem; border: 1px solid var(--rule); border-radius: 2px; font-family: inherit; font-size: 0.9375rem; background: #fff;"><option>ASAP</option><option>Within 1 month</option><option>1–3 months</option><option>3–6 months</option><option>Flexible</option><option>Not sure</option></select></label>
          <label style="display: grid; gap: 0.25rem;"><span style="font-size: 0.75rem; letter-spacing: 0.1em; text-transform: uppercase; color: var(--concrete);">Budget range</span><select style="padding: 0.625rem 0.875rem; border: 1px solid var(--rule); border-radius: 2px; font-family: inherit; font-size: 0.9375rem; background: #fff;"><option>&lt; $25K</option><option>$25–50K</option><option>$50–100K</option><option>$100–250K</option><option>$250–500K</option><option>$500K–1M</option><option>$1M+</option><option>Not sure</option></select></label>
        </div>
        <button type="button" class="btn btn-primary arrow" style="margin-top: 0.5rem; align-self: start;">Send Project Review request</button>
        <p style="font-size: 0.8125rem; color: var(--concrete); margin: 0;">This is a mockup form — submission is not wired up.</p>
      </form>
    </div>
    <aside style="background: var(--bg-deep); color: var(--bg-warm); padding: 2rem; border-radius: 2px; align-self: start;">
      <h3 style="color: var(--bg-warm); font-size: 1.125rem; margin: 0 0 1rem;">Get in touch</h3>
      <p style="color: rgba(247,243,236,0.85); margin: 0 0 0.5rem;"><strong style="color: var(--brass-soft); display: block; font-size: 0.7rem; letter-spacing: 0.16em; text-transform: uppercase; margin-bottom: 0.25rem;">Phone</strong>803.884.5751</p>
      <p style="color: rgba(247,243,236,0.85); margin: 0 0 0.5rem;"><strong style="color: var(--brass-soft); display: block; font-size: 0.7rem; letter-spacing: 0.16em; text-transform: uppercase; margin-bottom: 0.25rem;">Email</strong>contact@shanebuiltco.com</p>
      <p style="color: rgba(247,243,236,0.85); margin: 0 0 0.5rem;"><strong style="color: var(--brass-soft); display: block; font-size: 0.7rem; letter-spacing: 0.16em; text-transform: uppercase; margin-bottom: 0.25rem;">Office</strong>1805 Clemson Rd, Suite 291041<br/>Columbia, SC 29229</p>
      <p style="color: rgba(247,243,236,0.85); margin: 0 0 0.5rem;"><strong style="color: var(--brass-soft); display: block; font-size: 0.7rem; letter-spacing: 0.16em; text-transform: uppercase; margin-bottom: 0.25rem;">Service area</strong>Columbia, Cayce, Irmo, Forest Acres, West Columbia, Lexington, Lake Murray of Richland</p>
      <p style="color: rgba(247,243,236,0.85); margin: 1rem 0 0; font-size: 0.875rem;"><strong style="color: var(--brass-soft); display: block; font-size: 0.7rem; letter-spacing: 0.16em; text-transform: uppercase; margin-bottom: 0.25rem;">Response time</strong>Within 15 min during business hours · next business morning otherwise.</p>
    </aside>
  </div>
</section>
`);

console.log('\nAll pages generated.');
