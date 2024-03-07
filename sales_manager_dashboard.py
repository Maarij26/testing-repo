import frappe


@frappe.whitelist(allow_guest=True)
def get_information():
    return {
        "won_closed_amount": get_won_closed(),
        "stage_chart": total_amount_stage_chart(),  # Funnel data
        "topwon_chart": total_account_won(),
        "topAcounts_open_chart": total_account_open(),
        "amount_won_type_chart": amount_won_type(),
        "closed_won_rep_chart": closed_won_rep(),
        "closed_won80_rep_chart": closed_won80_rep(),
        "closed_lost_reason_chart": closed_lost_reason(),
        "winloss_ratio_chart": wl_ratio_rep(),
        "last_activity_chart": last_activity(),
    }


def get_won_closed():
    result = frappe.db.sql(
        """ SELECT FORMAT(sum(opportunity_amount), 'c', 'pa-ARAB-PK') as won_closed_amount
            FROM tabOpportunity
            where status = 'Closed'
        """,
        as_dict=0,
    )
    return result[0][0]


"""
    [
        ['Website visits', 15654],
        ['Downloads', 4064],
        ['Requested price list', 1987],
        ['Invoice sent', 976],
        ['Finalized', 846]
    ]
"""


def total_amount_stage_chart():
    result = frappe.db.sql(
        """
        SELECT sales_stage, sum(opportunity_amount)
        FROM `tabOpportunity`
        GROUP BY sales_stage
        ORDER BY sales_stage
    """,
        as_dict=0,
    )

    return result


def closed_won():
    return ""


"""
categories: ['Acme', 'Salesforce', 'Media', 'Others'],

datasets = [{
      name: '',
      data: [3, 6, 1, 2]
  }
  ];
"""


def total_account_won():
    result = frappe.db.sql(
        """
        SELECT customer_name,opportunity_amount
        FROM `tabOpportunity`
        WHERE status = "closed"
        GROUP BY customer_name
""",
        as_dict=1,
    )
    categories = [d.customer_name for d in result]
    data = [d.opportunity_amount for d in result]
    return {"categories": categories, "data": data}


def total_account_open():
    result = frappe.db.sql(
        """
        SELECT customer_name, sum(opportunity_amount) as op_amount
        FROM `tabOpportunity`
        where status = "Open"
        GROUP BY customer_name

""",
        as_dict=1,
    )
    # frappe.msgprint(f"The accounts open is :{result}")
    categories = [d.customer_name for d in result]
    data = [d.op_amount for d in result]
    # frappe.msgprint(f"The accounts open is :{categories,data}")
    return {"categories": categories, "data": data}


def amount_won_type():
    result = frappe.db.sql(
        """
        SELECT
    CASE
        WHEN 
            (MONTH(creation) BETWEEN 7 AND 9 AND MONTH(modified) BETWEEN 7 AND 9)
            OR (MONTH(creation) BETWEEN 10 AND 12 AND MONTH(modified) BETWEEN 10 AND 12)
            OR (MONTH(creation) BETWEEN 1 AND 3 AND MONTH(modified) BETWEEN 1 AND 3)
            OR (MONTH(creation) BETWEEN 4 AND 6 AND MONTH(modified) BETWEEN 4 AND 6)
            THEN 'New Business'
        WHEN 
            (MONTH(creation) = MONTH(modified) - 3 OR MONTH(creation) = MONTH(modified) + 9)
            AND (YEAR(creation) = YEAR(modified))
            THEN 'Existing Business'
        ELSE 'Invalid Business Type'
    END AS name,
    sum(opportunity_amount) as data
FROM
    `tabOpportunity`
WHERE
    status = 'Closed'

""",
        as_dict=1,
    )
    # frappe.msgprint(f"The Amount Won by type is :{result}")
    categories = [d.name for d in result]
    data = [d.data for d in result]
    return {"categories": categories, "data": data}


#     frappe.msgprint(f"The accounts open is :{result}")
#    categories = [d.customer_name for d in result]
#    data = [d.op_amount for d in result]
#    return {"categories": categories, "data": data}


"""
[{
                name: 'First dogs',
                label: '1951: First dogs in space',
                description: '22 July 1951 First dogs in space (Dezik and Tsygan) '
            }, {
                name: 'Sputnik 1',
                label: '1957: First artificial satellite',
                description: '4 October 1957 First artificial satellite. First signals from space.'
            }, {
                name: 'First human spaceflight',
                label: '1961: First human spaceflight (Yuri Gagarin)',
                description: 'First human spaceflight (Yuri Gagarin), and the first human-crewed orbital flight'
            }, {
                name: 'First human on the Moon',
                label: '1969: First human on the Moon',
                description: 'First human on the Moon, and first space launch from a celestial body other than the Earth. First sample return from the Moon'
            }]
"""


def closed_won_rep():
    result = frappe.db.sql(
        """
            SELECT 
                owners.opportunity_owner,
                sources.source,
                IFNULL(SUM(opportunity.opportunity_amount), 0) AS amount
            FROM
                (SELECT DISTINCT opportunity_owner FROM tabOpportunity) AS owners
            CROSS JOIN
                (SELECT DISTINCT IFNULL(source, 'No Source') AS source FROM tabOpportunity) AS sources
            LEFT JOIN
                tabOpportunity AS opportunity ON owners.opportunity_owner = opportunity.opportunity_owner AND IFNULL(opportunity.source, 'No Source') = sources.source AND opportunity.status = "Closed"
            GROUP BY 
                owners.opportunity_owner, sources.source;
""",
        as_dict=1,
    )
    # frappe.throw(f"result: {result}")
    owners_sources_dict = {}
    owners = list(set([d.opportunity_owner for d in result]))
    sources = list(set([d.source for d in result]))
    # len_of_owners = len(owners)
    # frappe.msgprint(f"len_of_owners: {len_of_owners}")
    # frappe.msgprint(f"owners fron closed_won: {owners}")

    series = []

    # len_of_source = len(sources)
    # frappe.msgprint(f"len og sources: {len_of_source}")
    # frappe.msgprint(f"sources fron closed_won: {sources}")

    for own in owners:
        owners_sources_dict[own] = {
            d.source: [d.amount] for d in result if (d.opportunity_owner == own)
        }

    # frappe.msgprint(f"owners_sources_dict fron closed_won: {owners_sources_dict}")

    for source in sources:
        ret_dict = {
            "name": source,
            "data": [],
        }  # Create a new dictionary for each source
        for key, value in owners_sources_dict.items():
            ret_dict["data"].append(value.get(source))
        series.append(ret_dict)

    return {"categories": owners, "data": series}


def closed_won80_rep():
    result = frappe.db.sql(
        """
        SELECT opportunity_owner, ifnull(source,'No Source') as source, sum(opportunity_amount) as data
        FROM `tabOpportunity`
        where probability >= 80
        GROUP BY opportunity_owner, source
""",
        as_dict=1,
    )
    # frappe.msgprint(f"The closed won 80 is :{result}")
    categories = list(set([d.opportunity_owner for d in result]))
    frappe.msgprint(f"categories fron closed_won80: {categories}")

    data = [{"name": d.source, "data": [d.data]} for d in result]
    frappe.msgprint(f"data fron closed_won80: {data}")

    # frappe.msgprint(f"The Closed won rep is : {categories, data}")
    return {"categories": categories, "data": data}


"""
    SELECT
    CASE
        WHEN MONTH(Op.transaction_date) BETWEEN 7 AND 9 THEN '1st Quarter'
        WHEN MONTH(Op.transaction_date) BETWEEN 10 AND 12 THEN '2nd Quarter'
        WHEN MONTH(Op.transaction_date) BETWEEN 1 AND 3 THEN '3rd Quarter'
        WHEN MONTH(Op.transaction_date) BETWEEN 4 AND 6 THEN '4th Quarter'
    END AS FiscalQuarter,
    SUM(opportunity_amount) AS TotalAmount
FROM
    'tabOpportunity' as Op
JOIN
    'tabOpportunity Lost Reason' as Lr ON Op.lost_reason = Lr.lost_reasons
WHERE
    status = 'Lost'
GROUP BY
    FiscalQuarter
"""


def closed_lost_reason():
    result = frappe.db.sql(
        """
SELECT
        olr.lost_reason as name,
        SUM(op.opportunity_amount) AS data
    FROM
        `tabOpportunity` AS op
    LEFT JOIN
        `tabOpportunity Lost Reason Detail` AS olr ON op.name = olr.parent
    WHERE
        status = 'Lost'
    GROUP BY
        lost_reason
""",
        as_dict=1,
    )
    # frappe.msgprint(f"The Closed lost by reason is :{result}")
    categories = [d.name for d in result]
    data = [d.data for d in result]
    return {"categories": categories, "data": data}


def wl_ratio_rep():
    result = frappe.db.sql(
        """
SELECT
        opportunity_owner,
        COUNT(*) AS TotalOpportunities,
        SUM(CASE WHEN status = 'Closed' THEN 1 ELSE 0 END) AS ClosedCount,
        SUM(CASE WHEN status = 'Lost' THEN 1 ELSE 0 END) AS LostCount,
        CASE
        WHEN (SUM(CASE WHEN status = 'Closed' THEN 1 ELSE 0 END) + SUM(CASE WHEN status = 'Lost' THEN 1 ELSE 0 END)) = 0 THEN 100
        ELSE (SUM(CASE WHEN status = 'Closed' THEN 1 ELSE 0 END) / (SUM(CASE WHEN status = 'Closed' THEN 1 ELSE 0 END) + SUM(CASE WHEN status = 'Lost' THEN 1 ELSE 0 END))) * 100
    END AS WinLossRatio
    FROM
        `tabOpportunity`
    WHERE
        status IN ('Closed', 'Lost')
    GROUP BY
        opportunity_owner;
""",
        as_dict=1,
    )
    # frappe.msgprint(f"The win/lost ratio is :{result}")
    categories = [d.opportunity_owner for d in result]
    data = [d.WinLossRatio for d in result]
    return {"categories": categories, "data": data}


def last_activity():
    result = frappe.db.sql(
        """
    SELECT probability,
    COUNT(modified) AS modifiedCount
FROM
    `tabOpportunity`
WHERE
    modified < CURDATE() - INTERVAL 4 DAY
GROUP BY
    probability;
""",
        as_dict=1,
    )
    # frappe.msgprint(f"The last activity is :{result}")
    categories = [d.probability for d in result]
    data = [d.modifiedCount for d in result]
    return {"categories": categories, "data": data}
