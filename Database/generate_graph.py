# Import required libraries for database connection, data manipulation and visualization
import redshift_connector
import sys
import json
import pandas as pd
import seaborn as sns
import matplotlib.pyplot as plt
import matplotlib.ticker as ticker
from mysql.connector import Error

# Get command line arguments for countries and graph type
countries = sys.argv[1]
graphType = sys.argv[2]
countries = json.loads(countries)

# Example values for testing
# graphType = "annual_co2_emissions"
# countries = ["Canada","Russia","World"]

# Establish connection to AWS Redshift database
connection = redshift_connector.connect(
    host='redshift-cluster-1.cigoy313aggq.us-east-1.redshift.amazonaws.com',
    database='dev',
    port=5439,
    user='awsuser',
    password='Winter2023'
)

# Function to execute SQL query and return results
def read_query(connection, query):
    cursor = connection.cursor()
    result = None
    try:
        cursor.execute(query)
        result = cursor.fetchall()
        return result
    except Error as err:
        print(f"Error: '{err}'")

# Convert countries list to SQL-friendly string format
countries_str = "', '".join(countries)

# Construct SQL query to fetch emission data
co2Query = f'''
    SELECT Entity,
    {graphType},
    Year
    FROM finalProject2
    WHERE Entity in ('{countries_str}')
'''

# Execute query and store results
co2_data = read_query(connection, co2Query)

# Convert query results to pandas DataFrame
df_co2_final = pd.DataFrame(co2_data, columns=['Entity', graphType, 'Year'])

# Dictionary containing graph configurations for different emission types
graph_values = {
    'annual_co2_emissions': {
        'ylabel': 'Billions Tonnes of CO2',
        'title': 'Annual CO2 Emissions (1950 - 2018)',
    },
    'per_gdp_co2': {
        'ylabel': 'Billions Tonnes of CO2 per $ of GDP',
        'title': 'Carbon Emissions intensity of economies (1950 - 2018)'
    },
    'annual_nitrous_oxide_emissions': {
        'ylabel': 'Billions Tonnes of Nitrous Oxide',
        'title': 'Annual Nitrous Oxide emmissions (1950 - 2018)'
    },
    'annual_methane_emissions': {
        'ylabel': 'Billions Tonnes of Methane',
        'title': 'Annual Methane emmissions (1950 - 2018)'
    },
    'per_capita_co2': {
        'ylabel': 'Billions Tonnes of CO2 per capita',
        'title': 'Per Capita by CO2 Emissions (1950 - 2018)'
    },
    'c02_emmissions_worldtotal': {
        'ylabel': 'Percentage of CO2 Emissions',
        'title': 'Annual share of gloabl CO2 emmissions (1950 - 2018)'
    },
    'co2_from_greenhouse_emissions': {
        'ylabel': 'Billions Tonnes of CO2',
        'title': 'Annual CO2 Emissions from Greenhouse Gas (1950 - 2018)'
    },
    'annual_greenhouse_gas_emissions': {
        'ylabel': 'Billions Tonnes of CO2',
        'title': 'Annual Greenhouse Gas Emissions (1950 - 2018)'
    }
}

# Get specific graph configuration based on selected graph type
graph_ylabel = graph_values[graphType]["ylabel"]
graph_title = graph_values[graphType]['title']

# Create and configure the visualization
with plt.style.context('Solarize_Light2'):
    # Create figure with specified size
    fig, axs = plt.subplots(figsize=(10, 5))

    # Create line plot using seaborn
    co2_country = sns.lineplot(
        data=df_co2_final,
        x='Year',
        y=graphType,
        hue='Entity'
    )

    # Set graph labels and limits
    co2_country.set(
        xlabel='Date',
        ylabel=f'{graph_ylabel}',
        ylim=(0, None),
        title=f'{graph_title}'
    )
    
    # Set x-axis range to match data
    axs.set_xlim(df_co2_final['Year'].min(), df_co2_final['Year'].max())

    # Configure x-axis ticks
    plt.xticks(range(1950, 2018, 5), range(1950, 2018, 5))

    # Position legend outside of plot
    plt.legend(bbox_to_anchor=(1.05, 1), loc='upper left',
               borderaxespad=0, title="")

    # Save the generated graph as PNG file
    fig.savefig(f'../Database/Pictures/{graphType}.png', bbox_inches='tight')
