import pandas as pd

file_path = "./../raw_data/"

def transform(file_name):
	df = pd.read_csv(file_path + file_name)

	df = df.rename(columns = {"Country/Region" : "country"})

	piv_df = df.melt(id_vars=["Province/State",	"country", "Lat", "Long"], \
	        var_name="date", \
	        value_name="cases").drop(["Province/State", "Lat", "Long"], axis = 1)

	piv_df['date'] = pd.to_datetime(piv_df['date'],format='%m/%d/%y')

	refined_df = piv_df.where((piv_df.date >= "2021-01-01") & (piv_df.date.dt.day == 1)).dropna()
	result_df = refined_df.groupby(['country', 'date']).sum()

	result_df.to_csv("./../data/" + file_name)

confirmed_file = "time_series_covid19_confirmed_global.csv"
deaths_file = "time_series_covid19_deaths_global.csv"
recovered_file = "time_series_covid19_recovered_global.csv"

transform(confirmed_file)
transform(deaths_file)
transform(recovered_file)

print("Saved files to data folder")






