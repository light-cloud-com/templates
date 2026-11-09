namespace CrudApi.Models;

/// <summary>limit and offset of GET /items.</summary>
public readonly record struct PageRequest(long Limit, long Offset)
{
    public const string Rule = "limit must be 1 to 100 and offset 0 or more";

    /// <summary>Missing values give the defaults (20, 0); anything else must be a whole number in range.</summary>
    public static bool TryParse(string? limit, string? offset, out PageRequest page)
    {
        long take = 20, skip = 0;
        var ok = (limit is null || (long.TryParse(limit, out take) && take is >= 1 and <= 100)) &&
                 (offset is null || (long.TryParse(offset, out skip) && skip >= 0));
        page = new PageRequest(take, skip);
        return ok;
    }
}
