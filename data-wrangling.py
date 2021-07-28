import pandas as pd

file_path = "/Users/mbandaru/illinois_workspace/Data Visualization/Week 4/Data/COVID-19-master-Cases/csse_covid_19_data/csse_covid_19_time_series/"

confirmed_file = "time_series_covid19_confirmed_global.csv"

def transform(file_name):
	df = pd.read_csv(file_path + file_name)

	df = df.rename(columns = {"Country/Region" : "country"})

	piv_df = df.melt(id_vars=["Province/State",	"country", "Lat", "Long"], \
	        var_name="date", \
	        value_name="cases").drop(["Province/State", "Lat", "Long"], axis = 1)
	


	piv_df['date'] = pd.to_datetime(piv_df['date'],format='%m/%d/%y')

	refined_df = piv_df.where((piv_df.date >= "2021-01-01") & (piv_df.date.dt.day == 1)).dropna()

	refined_df.to_csv(file_name, index=False)

transform(confirmed_file)





