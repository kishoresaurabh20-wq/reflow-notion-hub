import pandas as pd
import bar_chart_race as bcr
import matplotlib
import imageio_ffmpeg

matplotlib.rcParams['animation.ffmpeg_path'] = imageio_ffmpeg.get_ffmpeg_exe()

# Annual data 2010–2024: Apparel + Textile Exports (HS 50-63) in USD billions
# Sources: WTO, UN Comtrade / OEC — actuals through 2023, 2024 estimated
data = {
    'Year': [2010, 2011, 2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019,
             2020, 2021, 2022, 2023, 2024],
    'China':        [210, 240, 255, 270, 278, 280, 272, 268, 290, 310,
                     275, 280, 265, 268, 280],
    'Bangladesh':   [ 15,  19,  21,  24,  26,  28,  30,  33,  36,  38,
                      32,  40,  45,  46,  47],
    'Vietnam':      [ 12,  15,  17,  20,  23,  25,  27,  30,  33,  35,
                      31,  37,  40,  41,  44],
    'Germany':      [ 26,  29,  30,  31,  32,  32,  33,  34,  35,  36,
                      31,  35,  38,  39,  39],
    'Italy':        [ 24,  27,  28,  30,  31,  30,  31,  32,  34,  34,
                      29,  34,  37,  38,  38],
    'India':        [ 20,  23,  25,  27,  28,  28,  29,  30,  32,  32,
                      27,  33,  35,  36,  37],
    'Turkey':       [ 18,  20,  22,  24,  25,  25,  26,  27,  29,  29,
                      25,  30,  32,  34,  35],
    'United States':[ 12,  13,  14,  15,  17,  18,  18,  19,  21,  22,
                      18,  22,  24,  25,  26],
    'Pakistan':     [  8,   9,  10,  11,  12,  12,  13,  13,  14,  15,
                      13,  16,  17,  18,  19],
    'Spain':        [ 12,  14,  15,  16,  17,  18,  19,  20,  21,  22,
                      18,  23,  25,  26,  27],
}

df = pd.DataFrame(data).set_index('Year')

bcr.bar_chart_race(
    df=df,
    title='Top 10 Countries by Apparel + Textile Export Value (USD billions)\nData: WTO / UN Comtrade / OEC | 2010–2024',
    filename='apparel_textile_race_updated.mp4',
    n_bars=10,
    steps_per_period=20,   # fewer interpolation frames → slower perceived change
    period_length=1800,    # 1.8 s per year — plenty of time to read each year
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
