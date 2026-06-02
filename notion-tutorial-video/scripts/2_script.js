// scripts/2_script.js
// Narration text per screen — edit these to match your voice/style

const NARRATION = {
  '00_founder_dashboard': `Welcome to the Indie Apparel Brand OS — US Edition.
    This is your Founder Dashboard — the command center for your entire brand operation.
    Every key metric, every live status update, all in one place.
    Let's walk through what's powering it.`,

  '01_production_calendar': `This is the Production Calendar — your Time and Action tracker.
    Every critical milestone from fabric booking to ex-factory is mapped here.
    If a deadline slips, you see it immediately — before your buyer does.`,

  '02_style_master': `The Style Master is your single source of truth for every SKU.
    Tech pack reference, fabric composition, target FOB, seasonal assignment —
    one card per style, no more hunting across files.
    When you're managing 30-plus styles heading into a season, this view saves hours every week.`,

  '03_bom': `The Bill of Materials tracks every raw material per style.
    Fabric, trims, labels, hangtags — each line item with unit cost and consumption quantity.
    The extended cost formula runs automatically.
    No more manually multiplying yardage by price per yard every time costs change.`,

  '04_vendor_directory': `The Vendor Directory is your full supplier network in one database.
    Factory contacts, payment terms, lead times, MOQs, country of origin, audit status.
    Filter by capability or tier when you're sourcing a new category.
    Stop digging through email threads to remember what you negotiated six months ago.`,

  '05_landed_cost': `This is the Landed Cost Sheet — the most important costing tool in the OS.
    It pulls your material costs, adds CMT and freight, applies the correct US import duty formula,
    and outputs landed cost, wholesale, and retail in one row per style.
    Most brands get burned by duty they never modelled. This fixes that.`,

  '06_sample_log': `The Sample Log tracks every sample request, fit comment, and approval status.
    You always know which styles are approved, which are pending revision,
    and which are holding up your production calendar.`,

  '07_drop_launch': `The Drop and Launch Center is your go-to-market planner.
    Each drop gets its own card with launch date, channel strategy, and status.
    Link it directly to your production calendar so your marketing timeline
    never gets ahead of your actual production status.`,

  '08_drop_performance': `The Drop Performance Tracker closes the loop.
    After each launch, you log sell-through, revenue, and margin here.
    Over time this becomes your most valuable data —
    telling you which styles, price points, and seasons actually work for your brand.`,

  '09_production_dashboard': `Finally, the Production Dashboard.
    On-time delivery rate, styles by status, vendor load —
    all pulling live from your databases, no manual updates required.
    This is the view you open every Monday morning to run your week.`,
};

const fs = require('fs');
const path = require('path');

const outputPath = path.join(__dirname, '../assets/narration_script.json');
fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, JSON.stringify(NARRATION, null, 2));
console.log('✅ Narration script saved to assets/narration_script.json');
console.log('📝 Edit the text in this file before generating voiceover.');
