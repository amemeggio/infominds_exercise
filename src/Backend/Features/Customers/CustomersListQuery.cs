using MediatR;

namespace Backend.Features.Customers;


public class CustomerListQuery : IRequest<List<CustomerListQueryResponse>>
{
    public string? Name { get; set; }
    public string? Email { get; set; }

    public string? SearchText { get; set; }
}

public class CustomerListQueryResponse
{
    public int Id { get; set; }
    public string Name { get; set; } = "";
    public string Address { get; set; } = "";
    public string Email { get; set; } = "";
    public string Phone { get; set; } = "";
    public string Iban { get; set; } = "";
    public CustomersListQueryResponseCategory? Category { get; set; }
}

public class CustomersListQueryResponseCategory
{
    public string Code { get; set; } = "";
    public string Description { get; set; } = "";
}

internal class CustomerListQueryHandler(BackendContext context) : IRequestHandler<CustomerListQuery, List<CustomerListQueryResponse>>
{
    private readonly BackendContext context = context;

    public async Task<List<CustomerListQueryResponse>> Handle(CustomerListQuery request, CancellationToken cancellationToken)
    {
        var query = context.Customers.AsQueryable();

        // Apply SearchText filter if provided.
        // (maintained additional Name and Email filters
        // if i want to implement filters for those specific fields in future)
        if (!string.IsNullOrEmpty(request.SearchText))
        {
            var lowerSearchText = request.SearchText.ToLower();
            query = query.Where(q =>
                q.Name.ToLower().Contains(lowerSearchText) ||
                q.Email.ToLower().Contains(lowerSearchText)
            );
        }

        // Apply Name filter if provided
        if (!string.IsNullOrEmpty(request.Name))
            query = query.Where(q => q.Name.ToLower().Contains(request.Name.ToLower()));

        // Apply Email filter if provided
        if (!string.IsNullOrEmpty(request.Email))
            query = query.Where(q => q.Email.ToLower().Contains(request.Email.ToLower()));

        var data = await query.OrderBy(q => q.Name).ToListAsync(cancellationToken);
        var result = new List<CustomerListQueryResponse>();

        foreach (var item in data)
        {
            var resultItem = new CustomerListQueryResponse
            {
                Id = item.Id,
                Name = item.Name,
                Address = item.Address,
                Email = item.Email,
                Phone = item.Phone,
                Iban = item.Iban,
            };

            var customerCategory = await context.CustomerCategories.SingleOrDefaultAsync(q => q.Id == item.CustomerCategoryId, cancellationToken);
            if (customerCategory is not null)
                resultItem.Category = new CustomersListQueryResponseCategory
                {
                    Code = customerCategory.Code,
                    Description = customerCategory.Description
                };
            
            result.Add(resultItem);
        }

        return result;
    }
}