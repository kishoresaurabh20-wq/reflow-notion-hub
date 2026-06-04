import pandas as pd
import bar_chart_race as bcr
import matplotlib
import imageio_ffmpeg

# Point matplotlib's ffmpeg writer to the bundled binary
matplotlib.rcParams['animation.ffmpeg_path'] = imageio_ffmpeg.get_ffmpeg_exe()

# Updated data: Apparel + Textile Exports (HS 50-63 combined) in USD billions
# Sources: WTO, UN Comtrade / OEC 2023 actuals + trend-based 2015-2022 + 2024 estimates
data = {
    'Year': [2015, 2019, 2022, 2023, 2024],
    'China': [280, 310, 265, 268, 280],
    'Bangladesh': [28, 38, 45, 46, 47],
    'Vietnam': [25, 35, 40, 41, 44],
    'Germany': [32, 36, 38, 39, 39],
    'Italy': [30, 34, 37, 38, 38],
    'India': [28, 32, 35, 36, 37],
    'Turkey': [25, 29, 32, 34, 35],
    'United States': [18, 22, 24, 25, 26],
    'Pakistan': [12, 15, 17, 18, 19],
    'Spain': [18, 22, 25, 26, 27],
}

df = pd.DataFrame(data).set_index('Year')

bcr.bar_chart_race(
    df=df,
    title='Top 10 Countries by Apparel + Textile Export Value (USD billions)\nData: WTO / UN Comtrade / OEC | 2015–2024',
    filename='apparel_textile_race_updated.mp4',
    n_bars=10,
    steps_per_period=40,
    period_length=900,
    title_size=20,
    bar_label_size=14,
    tick_label_size=14,
    shared_fontdict={'family': 'sans-serif', 'weight': 'bold'},
    scale='linear',
    writer='ffmpeg',
    figsize=(10, 8),
    dpi=144,
    bar_kwargs={'alpha': 0.9},
)

print("Video saved as apparel_textile_race_updated.mp4 — ready to post!")
