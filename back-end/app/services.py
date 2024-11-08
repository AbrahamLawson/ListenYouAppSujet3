from .models import SongPopularity

def get_trends(region, year_range):
    trends = SongPopularity.query.filter_by(region=region)\
              .filter(SongPopularity.year.between(year_range[0], year_range[1]))\
              .all()
    
    results = []
    for trend in trends:
        results.append({
            'song_id': trend.song_id,
            'year': trend.year,
            'popularity_score': trend.popularity_score,
        })
    return results
