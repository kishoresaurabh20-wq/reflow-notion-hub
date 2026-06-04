import io
import os
import numpy as np
import pandas as pd
import matplotlib
import matplotlib.pyplot as plt
import matplotlib.image as mpimg
import matplotlib.animation as animation
from matplotlib.offsetbox import OffsetImage, AnnotationBbox
import imageio_ffmpeg
import requests
import cairosvg

matplotlib.rcParams['animation.ffmpeg_path'] = imageio_ffmpeg.get_ffmpeg_exe()

# --- Data ---
data = {
    'Year': [2005, 2010, 2015, 2019, 2022, 2023, 2024],
    'China':         [120, 180, 280, 310, 265, 268, 280],
    'Bangladesh':    [  8,  15,  28,  38,  45,  46,  47],
    'Vietnam':       [  4,  10,  25,  35,  40,  41,  44],
    'Germany':       [ 22,  25,  32,  36,  38,  39,  39],
    'Italy':         [ 22,  25,  30,  34,  37,  38,  38],
    'India':         [ 15,  20,  28,  32,  35,  36,  37],
    'Turkey':        [ 15,  20,  25,  29,  32,  34,  35],
    'United States': [ 12,  15,  18,  22,  24,  25,  26],
    'Pakistan':      [  6,   8,  12,  15,  17,  18,  19],
    'Spain':         [ 12,  15,  18,  22,  25,  26,  27],
}
df = pd.DataFrame(data).set_index('Year')

# --- Download and cache flags (SVG → PNG via cairosvg) ---
COUNTRY_ISO = {
    'China': 'cn', 'Bangladesh': 'bd', 'Vietnam': 'vn',
    'Germany': 'de', 'Italy': 'it', 'India': 'in',
    'Turkey': 'tr', 'United States': 'us', 'Pakistan': 'pk', 'Spain': 'es',
}
FLAG_BASE = 'https://raw.githubusercontent.com/lipis/flag-icons/main/flags/4x3'

os.makedirs('flags', exist_ok=True)
for country, iso in COUNTRY_ISO.items():
    path = f'flags/{country}.png'
    if not os.path.exists(path):
        url = f'{FLAG_BASE}/{iso}.svg'
        try:
            svg_bytes = requests.get(url, timeout=10).content
            png_bytes = cairosvg.svg2png(bytestring=svg_bytes, output_width=80)
            with open(path, 'wb') as f:
                f.write(png_bytes)
            print(f'  Downloaded flag: {country}')
        except Exception as e:
            print(f'  Warning – flag missing for {country}: {e}')

flag_imgs = {}
for country in df.columns:
    path = f'flags/{country}.png'
    if os.path.exists(path):
        try:
            flag_imgs[country] = mpimg.imread(path)
        except Exception as e:
            print(f'  Warning – could not load flag for {country}: {e}')

# --- Build interpolated frame list ---
STEPS_PER_PERIOD = 40   # interpolation steps between each data year
MS_PER_PERIOD    = 1800  # ms to display each period gap (slower = more readable)

years = df.index.tolist()
frames = []  # (year_float, pd.Series)
for i in range(len(years) - 1):
    y0, y1 = years[i], years[i + 1]
    v0 = df.loc[y0].values.astype(float)
    v1 = df.loc[y1].values.astype(float)
    for step in range(STEPS_PER_PERIOD):
        frac = step / STEPS_PER_PERIOD
        frames.append((
            y0 + (y1 - y0) * frac,
            pd.Series(v0 + (v1 - v0) * frac, index=df.columns),
        ))
frames.append((years[-1], df.loc[years[-1]].astype(float)))

# --- Stable colour map (one colour per country) ---
CMAP = plt.cm.tab10
color_map = {c: CMAP(i / 10) for i, c in enumerate(df.columns)}

GLOBAL_MAX = float(df.values.max())
N_BARS = len(df.columns)

# --- Figure ---
fig, ax = plt.subplots(figsize=(12, 8))
fig.patch.set_facecolor('#f4f4f4')
# left margin wide enough for flag + country name
fig.subplots_adjust(left=0.30, right=0.94, top=0.91, bottom=0.09)

FLAG_ZOOM   = 0.42   # scale of the 80-px flag PNG
FLAG_OFFSET = -118   # points left of the y-axis (x=0 data coord)
NAME_X      = -GLOBAL_MAX * 0.015  # data-coord x for right-aligned country name

def draw_frame(frame_idx):
    year_f, vals = frames[frame_idx]
    ax.clear()
    ax.set_facecolor('#f4f4f4')
    ax.set_xlim(0, GLOBAL_MAX * 1.18)
    ax.set_ylim(-0.6, N_BARS - 0.4)

    sorted_vals = vals.sort_values(ascending=True)
    countries   = sorted_vals.index.tolist()
    values      = sorted_vals.values
    y_pos       = np.arange(len(countries))

    # Bars
    ax.barh(y_pos, values,
            color=[color_map[c] for c in countries],
            alpha=0.88, height=0.72, zorder=2, clip_on=False)

    # Value label to the right of each bar
    for i, v in enumerate(values):
        ax.text(v + GLOBAL_MAX * 0.01, i, f'${v:.0f}B',
                va='center', ha='left', fontsize=11,
                fontweight='bold', color='#2a2a2a')

    # Country name (right-aligned, just left of y-axis)
    ax.set_yticks([])
    for i, country in enumerate(countries):
        ax.text(NAME_X, i, country,
                va='center', ha='right', fontsize=12,
                fontweight='bold', color='#1a1a1a', clip_on=False)

    # Flag image (left of country name)
    for i, country in enumerate(countries):
        img = flag_imgs.get(country)
        if img is not None:
            oi = OffsetImage(img, zoom=FLAG_ZOOM)
            oi.image.axes = ax
            ab = AnnotationBbox(
                oi,
                xy=(0, i),           # anchor: x=0 on the data axis
                xycoords='data',
                xybox=(FLAG_OFFSET, 0),
                boxcoords='offset points',
                pad=0.05, frameon=False,
            )
            ab.set_clip_on(False)
            ax.add_artist(ab)

    # Large year watermark
    ax.text(0.96, 0.06, str(int(round(year_f))),
            transform=ax.transAxes, fontsize=54, fontweight='bold',
            ha='right', va='bottom', color='#d0d0d0', zorder=1)

    # Axes chrome
    ax.set_xlabel('USD Billions', fontsize=12, labelpad=8)
    ax.set_title(
        'Top 10 Countries: Apparel + Textile Exports (USD billions)\n'
        'Source: WTO / UN Comtrade / OEC  ·  2005 – 2024',
        fontsize=15, fontweight='bold', pad=10,
    )
    for spine in ['top', 'right', 'left']:
        ax.spines[spine].set_visible(False)
    ax.grid(axis='x', linestyle='--', alpha=0.35, zorder=0)
    ax.tick_params(axis='x', labelsize=11)

fps = STEPS_PER_PERIOD * 1000 / MS_PER_PERIOD   # ≈ 22 fps
print(f'Rendering {len(frames)} frames at {fps:.1f} fps '
      f'(~{len(frames)/fps:.0f}s video)…')

anim = animation.FuncAnimation(fig, draw_frame, frames=len(frames), repeat=False)
writer = animation.FFMpegWriter(
    fps=fps, bitrate=3000,
    extra_args=['-vcodec', 'libx264', '-pix_fmt', 'yuv420p'],
)
anim.save('apparel_textile_race_with_flags_2005-2024.mp4', writer=writer, dpi=144)
plt.close(fig)
print('Video saved as apparel_textile_race_with_flags_2005-2024.mp4')
